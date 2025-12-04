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
    if (email) email = String(email).toLowerCase().trim();

    // DEBUG: log incoming payload (no sensitive tokens)
    console.log(`🔍 [VerifyOTP] Incoming payload: email=${email}, code="${String(code)}", namePresent=${!!name}`);

    if (!email || !code) {
      console.log("🔍 [VerifyOTP] Missing email or code in request body");
      return NextResponse.json({ message: "Email and OTP required" }, { status: 400 });
    }

    // --- EXTRA DEBUG: fetch latest OTP doc for this identifier and print summary ---
    try {
      // cast to any for safe logging (lean() can confuse TS)
      const latest: any = await OTP.findOne({ identifier: email }).sort({ createdAt: -1 }).lean();
      if (latest) {
        console.log("🔍 [VerifyOTP] Latest OTP doc for identifier:", {
          id: latest._id?.toString?.() || latest._id,
          identifier: latest.identifier,
          type: latest.type || latest.channel,
          codeStored: String(latest.code),
          verified: latest.verified,
          createdAt: latest.createdAt,
          expiresAt: latest.expiresAt,
        });
      } else {
        console.log("🔍 [VerifyOTP] No OTP documents found for identifier:", email);
      }
    } catch (dbgErr) {
      console.error("🔍 [VerifyOTP] Error fetching latest OTP doc:", dbgErr);
    }

    // Call existing helper for verification (keeps existing logic)
    let verify = await verifyOTP(email, "email", String(code));
    console.log(`🔍 [VerifyOTP] verifyOTP result:`, verify);

    if (!verify.success) {
      console.log(`🔍 [VerifyOTP] verifyOTP returned failure (${verify.message}). Checking already-verified...`);
      const isAlreadyVerified = await checkVerifiedOTP(email, "email", String(code));
      console.log(`🔍 [VerifyOTP] checkVerifiedOTP: ${isAlreadyVerified}`);
      if (isAlreadyVerified) {
        verify = { success: true, message: "OTP already verified" };
      } else {
        console.log("🔍 [VerifyOTP] Final result: invalid OTP");
        return NextResponse.json({ message: verify.message }, { status: 400 });
      }
    }

    // Continue with existing account creation / sign-in flow...
    const token = req.cookies.get('token')?.value;
    let existingUserId = null;

    console.log(`🔍 [VerifyEmailOTP] Token present: ${!!token}`);

    if (token) {
      try {
        const decoded: any = await verifyToken(token);
        existingUserId = decoded?.userId || decoded?.id;
        console.log(`🔍 [VerifyEmailOTP] Token decoded, existingUserId: ${existingUserId}`);
      } catch (e) {
        console.log(`🔍 [VerifyEmailOTP] Token invalid or expired`);
        // invalid token -> ignore
      }
    }

    if (existingUserId) {
      let user = await User.findById(existingUserId);
      if (user) {
        const existingEmailUser = await User.findOne({ email, _id: { $ne: existingUserId } });
        if (existingEmailUser) {
          if (!existingEmailUser.phone || existingEmailUser.phone === '') {
            existingEmailUser.email = null;
            existingEmailUser.emailVerified = false;
            await existingEmailUser.save();
          } else {
            return NextResponse.json({
              message: "This email is already associated with another account. Please use a different email or login to that account."
            }, { status: 400 });
          }
        }
        user.email = email;
        user.emailVerified = true;
        await user.save();

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

        response.cookies.set("token", token as string, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }
    }

    // Normal signup/login flow
    let user = await User.findOne({ email });
    const isNewUser = !user;

    if (isNewUser && !name) {
      return NextResponse.json(
        { isNewUser: true, message: "Please provide your name to complete registration", email },
        { status: 200 }
      );
    }

    if (isNewUser) {
      try {
        user = await User.create({
          email,
          emailVerified: true,
          name: name?.trim(),
          role: "customer",
        });
      } catch (createError) {
        console.error("❌ [VerifyOTP] User creation failed:", createError);
        return NextResponse.json({ message: "Failed to create account. Email might be in use." }, { status: 400 });
      }
    } else {
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }

    const newToken = signJwt({ userId: user._id, role: user.role });

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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("❌ [VerifyOTP] Critical error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
