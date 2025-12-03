import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import { signJwt, verifyToken } from "@/lib/auth";
import { verifyOTP, checkVerifiedOTP } from "@/lib/otpHelpers";
import { successResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    let { email, code, name } = body;

    // Normalize email
    if (email) email = email.toLowerCase().trim();

    console.log(`🔐 [VerifyOTP] Request for ${email}, Name: ${name || 'N/A'}, Code: ${code}`);

    if (!email || !code) {
      return NextResponse.json({ message: "Email and OTP required" }, { status: 400 });
    }

    // Validate OTP using shared helper (handles Master OTP)
    let verify = await verifyOTP(email, "email", code);
    console.log(`🔐 [VerifyOTP] Initial check result:`, verify);

    if (!verify.success) {
      // If verification failed but we have a name (signup flow), check if it was ALREADY verified
      if (name) {
        console.log(`🔐 [VerifyOTP] Checking if already verified...`);
        const isAlreadyVerified = await checkVerifiedOTP(email, "email", code);
        console.log(`🔐 [VerifyOTP] Already verified? ${isAlreadyVerified}`);

        if (isAlreadyVerified) {
          verify = { success: true, message: "OTP already verified" };
        } else {
          return NextResponse.json({ message: verify.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ message: verify.message }, { status: 400 });
      }
    }

    // OTP is already marked as verified by the helper, so we just proceed to user lookup

    // STEP 2 — Check if this is an ADD operation (user already logged in)
    const token = req.cookies.get('token')?.value;
    let existingUserId = null;

    if (token) {
      try {
        const decoded: any = await verifyToken(token);
        existingUserId = decoded?.userId || decoded?.id;
      } catch (e) {
        // Token invalid, proceed as normal signup/login
      }
    }

    // If user is already logged in, update their existing account
    if (existingUserId) {
      console.log(`🔐 [VerifyOTP] Updating existing user ${existingUserId} with email`);
      let user = await User.findById(existingUserId);
      if (user) {
        // Check if email is already on a different user (duplicate from previous bug)
        const existingEmailUser = await User.findOne({
          email,
          _id: { $ne: existingUserId } // Not the current user
        });

        if (existingEmailUser) {
          console.log(`🔧 [VerifyOTP] Found duplicate user with email ${email}, checking if safe to remove...`);

          // If the duplicate user has no phone, it's likely an orphaned account from the bug
          if (!existingEmailUser.phone || existingEmailUser.phone === '') {
            console.log(`🔧 [VerifyOTP] Removing email from duplicate orphaned account`);
            existingEmailUser.email = null;
            existingEmailUser.emailVerified = false;
            await existingEmailUser.save();
          } else {
            // Email belongs to a real account with phone - can't proceed
            return NextResponse.json({
              message: "This email is already associated with another account. Please use a different email or login to that account."
            }, { status: 400 });
          }
        }

        // Update the existing user with the new email
        user.email = email;
        user.emailVerified = true;
        await user.save();
        console.log(`🔐 [VerifyOTP] Email added to existing user`);

        const response = successResponse({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
          },
          isNewUser: false,
          message: "Email added and verified successfully!",
        });

        // Keep the same token (same user)
        response.cookies.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }
    }

    // Normal signup/login flow: Check if user exists by email
    let user = await User.findOne({ email });
    const isNewUser = !user;
    console.log(`🔐 [VerifyOTP] User exists? ${!isNewUser}`);

    // If new user and no name provided, ask for it
    if (isNewUser && !name) {
      console.log(`🔐 [VerifyOTP] New user, requesting name`);
      return NextResponse.json(
        {
          isNewUser: true,
          message: "Please provide your name to complete registration",
          email
        },
        { status: 200 }
      );
    }

    // Create new user
    if (isNewUser) {
      console.log(`🔐 [VerifyOTP] Creating new user: ${name}`);
      try {
        user = await User.create({
          email,
          emailVerified: true,
          name: name.trim(),
          role: "customer",
        });
        console.log(`🔐 [VerifyOTP] User created: ${user._id}`);
      } catch (createError) {
        console.error("❌ [VerifyOTP] User creation failed:", createError);
        return NextResponse.json({ message: "Failed to create account. Email might be in use." }, { status: 400 });
      }
    } else {
      // Update existing user's email verification status
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }

    // Generate JWT
    const newToken = signJwt({
      userId: user._id,
      role: user.role,
    });

    const response = successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      isNewUser: false,
      message: isNewUser ? "Account created successfully!" : "Welcome back!",
    });

    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("❌ [VerifyOTP] Critical error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
