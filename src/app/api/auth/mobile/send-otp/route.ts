import { NextRequest } from "next/server";
import connectDB from "../../../../../lib/db";
import { successResponse, errorResponse } from "../../../../../utils/apiResponse";
import { createOTP, checkOTPRateLimit } from "../../../../../lib/otpHelpers";
import { smsService } from "../../../../../lib/smsService";
import { z } from "zod";

const sendOTPSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"),
  purpose: z.enum(["signup", "login", "verification"]).optional().default("login"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const result = sendOTPSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Validation Error", 400, result.error.format());
    }

    let { phone, purpose } = result.data;

    // Normalize phone number - remove spaces, ensure consistent format
    phone = phone.replace(/\s+/g, '').trim();

    console.log('📱 [SendMobileOTP] Request:', { phone, purpose });

    // Rate limit
    const rateLimit = await checkOTPRateLimit(phone, "mobile");
    if (!rateLimit.allowed) {
      return errorResponse(rateLimit.message, 429);
    }

    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create OTP
    const code = await createOTP(phone, "mobile", purpose, {
      ipAddress,
      userAgent,
    });

    console.log(`📱 [SendMobileOTP] OTP created for ${phone}: "${code}"`);

    // Send SMS (skip if MASTER_OTP is set)
    if (process.env.MASTER_OTP) {
      console.log(`📱 [SendMobileOTP] MASTER_OTP mode - skipping SMS send. Use code: "${process.env.MASTER_OTP.trim()}"`);
    } else {
      const sent = await smsService.sendOTP(phone, code);
      if (!sent) {
        console.error(`❌ [SendMobileOTP] Failed to send SMS to ${phone}`);
        return errorResponse("Failed to send OTP", 500);
      }
      console.log(`✅ [SendMobileOTP] SMS sent successfully to ${phone}`);
    }

    return successResponse({
      message: "OTP sent successfully",
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Send mobile OTP error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
