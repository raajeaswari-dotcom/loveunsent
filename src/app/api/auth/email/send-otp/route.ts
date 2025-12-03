import { NextRequest } from "next/server";
import connectDB from "../../../../../lib/db";
import { successResponse, errorResponse } from "../../../../../utils/apiResponse";
import { createOTP, checkOTPRateLimit } from "../../../../../lib/otpHelpers";
import { emailService } from "../../../../../lib/emailService";
import { z } from "zod";

const sendOTPSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
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

    const { email: rawEmail, purpose } = result.data;
    const email = rawEmail.toLowerCase().trim();

    const rateLimit = await checkOTPRateLimit(email, "email");
    if (!rateLimit.allowed) {
      return errorResponse(rateLimit.message, 429);
    }

    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const code = await createOTP(email, "email", purpose, { ipAddress, userAgent });

    console.log(`📧 Email OTP created for ${email}:`, code);

    const sent = await emailService.sendOTP(email, code);

    if (!sent) {
      console.error(`❌ Failed to send email OTP to ${email}`);
      return errorResponse("Failed to send OTP. Please try again.", 500);
    }

    console.log(`✅ Email OTP sent successfully to ${email}`);

    return successResponse({
      message: "OTP sent successfully to your email",
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Send email OTP error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
