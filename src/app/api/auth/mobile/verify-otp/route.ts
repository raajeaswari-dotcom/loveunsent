import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import { verifyOTP } from "@/lib/otpHelpers";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { signJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const { phone, code, name } = body;

        if (!phone || !code) {
            return errorResponse("Phone and OTP code are required", 400);
        }

        // STEP 1 — Verify OTP
        const verify = await verifyOTP(phone, "mobile", code);

        if (!verify.success) {
            return errorResponse(verify.message, 400);
        }

        // STEP 2 — Check if user exists
        let user = await User.findOne({ phone });
        const isNewUser = !user;

        // → New user flow - ask for name if not provided
        if (isNewUser && (!name || name.trim().length < 2)) {
            return NextResponse.json(
                {
                    isNewUser: true,
                    message: "Please provide your name to complete registration",
                    phone
                },
                { status: 200 }
            );
        }

        // Create new user
        if (isNewUser) {
            user = await User.create({
                phone,
                name: name.trim(),
                role: "customer",
                phoneVerified: true,
            });
        } else {
            // Update existing user's phone verification status
            if (!user.phoneVerified) {
                user.phoneVerified = true;
                await user.save();
            }
        }

        // STEP 3 — Generate JWT
        const token = signJwt({
            userId: user._id, // Fixed: use 'userId' to match email auth
            role: user.role,
        });

        // STEP 4 — Set cookie
        const response = successResponse({
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                phoneVerified: user.phoneVerified,
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
        console.error("Verify mobile OTP error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
