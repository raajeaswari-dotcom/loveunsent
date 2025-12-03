import { NextRequest } from "next/server";
import connectDB from "../../../../../lib/db";
import { successResponse, errorResponse } from "../../../../../utils/apiResponse";
import { createOTP, checkOTPRateLimit } from "../../../../../lib/otpHelpers";
import { emailService } from "../../../../../lib/emailService";
import { z } from "zod";

/* -----------------------------------------
   Validation schema
------------------------------------------ */
const sendOTPSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  purpose: z.enum(["signup", "login", "verification"]).optional().default("login"),
});

/* -----------------------------------------
   POST /api/auth/email/send-otp
------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = sendOTPSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation Error", 400, parsed.error.format());
    }

    const { email: rawEmail, purpose } = parsed.data;
    const email = rawEmail.toLowerCase().trim();   // IMPORTANT — must match verify route

    /* -----------------------------------------
       1. RATE LIMIT CHECK
    ------------------------------------------ */
    const rateLimit = await checkOTPRateLimit(email, "email");
    if (!rateLimit.allowed) {
      return errorResponse(rateLimit.message, 429);
    }

    /* -----------------------------------------
       2. METADATA (IP + User Agent)
    ------------------------------------------ */
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    /* -----------------------------------------
       3. GENERATE & STORE OTP
       (Matches EXACT createOTP signature)
    ------------------------------------------ */
    const code = await createOTP(email, "email", purpose, {
      ipAddress,
      userAgent,
    });

    console.log(`📧 OTP generated for ${email}:`, code);

    /* -----------------------------------------
       4. SEND OTP VIA EMAIL
    ------------------------------------------ */
    const sent = await emailService.sendOTP(email, code);

    if (!sent) {
      console.error(`❌ Failed to send OTP to ${email}`);
      return errorResponse("Failed to send OTP. Please try again.", 500);
    }

    console.log(`✅ Email OTP sent successfully to ${email}`);

    /* -----------------------------------------
       5. SUCCESS RESPONSE
    ------------------------------------------ */
    return successResponse({
      message: "OTP sent successfully",
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error("Send email OTP error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
