import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import { signJwt } from "@/lib/auth";
import { successResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, code, name } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: "Email and OTP required" }, { status: 400 });
    }

    // Validate OTP
    const otp = await OTP.findOne({
      identifier: email,
      channel: "email", // Fixed: use 'channel' not 'type'
      code: String(code),
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otp) {
      return NextResponse.json({ message: "Invalid or expired OTP. Please request a new one." }, { status: 400 });
    }

    // Mark OTP as verified
    otp.verified = true;
    await otp.save();

    // Check if user exists
    let user = await User.findOne({ email });
    const isNewUser = !user;

    // If new user and no name provided, ask for it
    if (isNewUser && !name) {
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
      user = await User.create({
        email,
        emailVerified: true,
        name: name.trim(),
        role: "customer",
      });
    } else {
      // Update existing user's email verification status
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }

    // Generate JWT
    const token = signJwt({
      userId: user._id,
      role: user.role,
    });

    const response = successResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      isNewUser: false,
      message: isNewUser ? "Account created successfully!" : "Welcome back!",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Verify email OTP error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
