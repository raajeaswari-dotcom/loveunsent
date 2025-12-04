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

        let { phone, code, name } = body;

        // Normalize phone - remove ALL spaces, ensure string
        if (phone) phone = String(phone).replace(/\s+/g, '').trim();
        // Ensure code is a string
        if (code) code = String(code).trim();

        // DEBUG: log incoming payload
        console.log(`🔍 [VerifyMobileOTP] Incoming: phone="${phone}", code="${code}", name="${name || 'N/A'}"`);

        if (!phone || !code) {
            console.log("🔍 [VerifyMobileOTP] ❌ Missing phone or code");
            return errorResponse("Phone and OTP code are required", 400);
        }

        // STEP 1 — Verify OTP
        let verify = await verifyOTP(phone, "mobile", code);
        console.log(`🔍 [VerifyMobileOTP] verifyOTP result:`, verify);

        if (!verify.success) {
            // Check if it was ALREADY verified (handle double-clicks or network retries)
            console.log(`🔍 [VerifyMobileOTP] Verification failed, checking if already verified...`);
            const isAlreadyVerified = await checkVerifiedOTP(phone, "mobile", code);
            console.log(`🔍 [VerifyMobileOTP] checkVerifiedOTP: ${isAlreadyVerified}`);

            if (isAlreadyVerified) {
                verify = { success: true, message: "OTP already verified" };
            } else {
                console.log("🔍 [VerifyMobileOTP] ❌ Final result: invalid OTP");
                return errorResponse(verify.message, 400);
            }
        }

        console.log("🔍 [VerifyMobileOTP] ✅ OTP verification passed!");

        // STEP 2 — Check if this is an ADD operation (user already logged in)
        const token = req.cookies.get('token')?.value;
        let existingUserId = null;

        console.log(`🔍 [VerifyMobileOTP] Token present: ${!!token}`);

        if (token) {
            try {
                const { verifyToken } = await import("@/lib/auth");
                const decoded: any = await verifyToken(token);
                existingUserId = decoded?.userId || decoded?.id;
                console.log(`🔍 [VerifyMobileOTP] Token decoded, existingUserId: ${existingUserId}`);
            } catch (e) {
                console.log(`🔍 [VerifyMobileOTP] Token invalid or expired`);
                // Token invalid, proceed as normal signup/login
            }
        }

        // If user is already logged in, update their existing account
        if (existingUserId) {
            let user = await User.findById(existingUserId);
            if (user) {
                // Check if phone number is already on a different user
                const existingPhoneUser = await User.findOne({
                    phone,
                    _id: { $ne: existingUserId }
                });

                if (existingPhoneUser) {
                    console.log(`🔧 [VerifyMobileOTP] Found duplicate user with phone ${phone}`);

                    if (!existingPhoneUser.email || existingPhoneUser.email === '') {
                        console.log(`🔧 [VerifyMobileOTP] Removing phone from orphaned account`);
                        existingPhoneUser.phone = null;
                        existingPhoneUser.phoneVerified = false;
                        await existingPhoneUser.save();
                    } else {
                        return NextResponse.json({
                            message: "This mobile number is already associated with another account."
                        }, { status: 400 });
                    }
                }

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

        // Normal signup/login flow: Check if user exists by phone
        let user = await User.findOne({ phone });
        const isNewUser = !user;

        // New user flow - ask for name if not provided
        if (isNewUser && (!name || name.trim().length < 2)) {
            console.log("🔍 [VerifyMobileOTP] New user, requesting name");
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
            console.log("🔍 [VerifyMobileOTP] ✅ Created new user:", user._id);
        } else {
            if (!user.phoneVerified) {
                user.phoneVerified = true;
                await user.save();
            }
            console.log("🔍 [VerifyMobileOTP] ✅ Existing user login:", user._id);
        }

        // STEP 3 — Generate JWT
        const newToken = signJwt({
            userId: user._id,
            role: user.role,
        });

        // STEP 4 — Set cookie and return
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
            maxAge: 60 * 60 * 24 * 7,
        });

        console.log("🔍 [VerifyMobileOTP] ✅ Login successful, token set");
        return response;

    } catch (error) {
        console.error("❌ [VerifyMobileOTP] Critical error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
