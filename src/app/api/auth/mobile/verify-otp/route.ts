import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import { verifyOTP, checkVerifiedOTP } from "@/lib/otpHelpers";
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
        let verify = await verifyOTP(phone, "mobile", code);

        if (!verify.success) {
            // If verification failed but we have a name (signup flow), check if it was ALREADY verified
            if (name) {
                const isAlreadyVerified = await checkVerifiedOTP(phone, "mobile", code);
                if (isAlreadyVerified) {
                    verify = { success: true, message: "OTP already verified" };
                } else {
                    return errorResponse(verify.message, 400);
                }
            } else {
                return errorResponse(verify.message, 400);
            }
        }

        // STEP 2 — Check if this is an ADD operation (user already logged in)
        // Get the token to see if user is already authenticated
        const token = req.cookies.get('token')?.value;
        let existingUserId = null;

        if (token) {
            try {
                const { verifyToken } = await import("@/lib/auth");
                const decoded: any = await verifyToken(token);
                existingUserId = decoded?.userId || decoded?.id;
            } catch (e) {
                // Token invalid, proceed as normal signup/login
            }
        }

        // If user is already logged in, update their existing account
        if (existingUserId) {
            let user = await User.findById(existingUserId);
            if (user) {
                // Check if phone number is already on a different user (duplicate from previous bug)
                const existingPhoneUser = await User.findOne({
                    phone,
                    _id: { $ne: existingUserId } // Not the current user
                });

                if (existingPhoneUser) {
                    console.log(`🔧 [VerifyOTP] Found duplicate user with phone ${phone}, checking if safe to remove...`);

                    // If the duplicate user has no email and no orders, it's likely an orphaned account from the bug
                    // We can safely remove the phone from it or delete it
                    if (!existingPhoneUser.email || existingPhoneUser.email === '') {
                        console.log(`🔧 [VerifyOTP] Removing phone from duplicate orphaned account`);
                        existingPhoneUser.phone = null;
                        existingPhoneUser.phoneVerified = false;
                        await existingPhoneUser.save();
                    } else {
                        // Phone belongs to a real account with email - can't proceed
                        return NextResponse.json({
                            message: "This mobile number is already associated with another account. Please use a different number or login to that account."
                        }, { status: 400 });
                    }
                }

                // Update the existing user with the new phone number
                user.phone = phone;
                user.phoneVerified = true;
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
                    message: "Mobile number added and verified successfully!",
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

        // Normal signup/login flow: Check if user exists by phone
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
        const newToken = signJwt({
            userId: user._id, // Fixed: use 'userId' to match email auth
            role: user.role,
        });

        // STEP 4 — Set cookie
        const response = successResponse({
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
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
        console.error("Verify mobile OTP error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
