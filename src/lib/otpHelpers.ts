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

  // Normalize email
  if (channel === "email" && identifier) {
    identifier = identifier.toLowerCase().trim();
  }

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
  // Normalize email
  if (channel === "email" && identifier) {
    identifier = identifier.toLowerCase().trim();
  }

  await connectDB();

  const codeStr = String(code);

  console.log(`[VerifyOTP] Verifying for: ${identifier}, Channel: ${channel}, Input: ${codeStr}`);
  console.log(`[VerifyOTP] MASTER_OTP env var: ${process.env.MASTER_OTP ? 'SET' : 'NOT SET'}`);

  // Master OTP bypass (works in any environment if env var is set)
  if (process.env.MASTER_OTP && codeStr === process.env.MASTER_OTP) {
    console.log('[VerifyOTP] Master OTP matched!');
    return { success: true, message: "OTP verified successfully (master)" };
  }

  // Dev bypass - Allow 123456 AND 12345
  if (process.env.NODE_ENV !== "production" && (codeStr === "123456" || codeStr === "12345")) {
    return { success: true, message: "OTP verified successfully (dev master)" };
  }

  const otp = await OTP.findOne({
    identifier,
    channel,         // ✅ FIXED
    code: codeStr,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  console.log(`[VerifyOTP] DB Lookup Result: ${otp ? 'FOUND' : 'NOT FOUND'}`);

  if (!otp) {
    // Debugging: Check if an OTP exists for this user but with a different code
    const existingOtp = await OTP.findOne({
      identifier,
      channel,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existingOtp) {
      console.log(`[VerifyOTP] Mismatch! Found OTP: ${existingOtp.code} for ${identifier}, but received: ${codeStr}`);
    } else {
      console.log(`[VerifyOTP] No active OTP found for ${identifier}`);
    }

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

/**
 * Check if an OTP was already verified (for multi-step signup)
 */
export async function checkVerifiedOTP(
  identifier: string,
  channel: "email" | "mobile",
  code: string | number
) {
  // Normalize email
  if (channel === "email" && identifier) {
    identifier = identifier.toLowerCase().trim();
  }

  await connectDB();
  const codeStr = String(code);

  // Master OTP bypass
  if (process.env.MASTER_OTP && codeStr === process.env.MASTER_OTP) {
    return true;
  }

  // Dev bypass
  if (process.env.NODE_ENV !== "production" && (codeStr === "123456" || codeStr === "12345")) {
    return true;
  }

  const otp = await OTP.findOne({
    identifier,
    channel,
    code: codeStr,
    verified: true, // Look for ALREADY verified
    expiresAt: { $gt: new Date() },
  });

  return !!otp;
}
