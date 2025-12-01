import crypto from "crypto";
import { OTP } from "../models/OTP";
import { User } from "../models/User";
import connectDB from "./db";

/**
 * Generate a 6-digit OTP code
 */
export function generateOTPCode(): string {
  if (process.env.MASTER_OTP) {
    return process.env.MASTER_OTP;
  }
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create and save an OTP
 */
export async function createOTP(
  identifier: string,
  channel: "email" | "mobile",   // 👈 rename so you never mix them
  purpose: "signup" | "login" | "verification" | "password_reset",
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<string> {

  await connectDB();

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate old OTPs
  await OTP.updateMany(
    { identifier, channel, verified: false },
    { $set: { verified: true } }
  );

  // CREATE NEW OTP (must use channel, NOT type)
  await OTP.create({
    identifier,
    channel,       // ✅ REQUIRED FIELD
    code,
    expiresAt,
    purpose,
    verified: false,
    attempts: 0,
    metadata,
  });

  return code;
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  identifier: string,
  channel: "email" | "mobile",
  code: string | number
) {
  await connectDB();

  const codeStr = String(code);

  // Master OTP bypass (works in any environment if env var is set)
  if (process.env.MASTER_OTP && codeStr === process.env.MASTER_OTP) {
    return { success: true, message: "OTP verified successfully (master)" };
  }

  // Dev bypass
  if (process.env.NODE_ENV !== "production" && codeStr === "123456") {
    return { success: true, message: "OTP verified successfully (dev master)" };
  }

  const otp = await OTP.findOne({
    identifier,
    channel,         // ✅ FIXED
    code: codeStr,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otp) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  if (otp.attempts >= 5) {
    return {
      success: false,
      message: "Too many attempts. Request a new OTP.",
    };
  }

  otp.attempts += 1;
  otp.verified = true;
  await otp.save();

  return { success: true, message: "OTP verified successfully" };
}

/**
 * Rate Limit
 */
export async function checkOTPRateLimit(
  identifier: string,
  channel: "email" | "mobile"
) {
  await connectDB();

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const count = await OTP.countDocuments({
    identifier,
    channel,        // ✅ FIXED
    createdAt: { $gte: fifteenMinutesAgo },
  });

  if (count >= 3) {
    return {
      allowed: false,
      message: "Too many OTP requests. Try again later.",
    };
  }

  return { allowed: true, message: "OK" };
}
