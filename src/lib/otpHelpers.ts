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
 * Helper to normalize identifiers
 */
function normalizeIdentifier(identifier: string, channel: "email" | "mobile"): string {
  if (!identifier) return identifier;

  if (channel === "email") {
    return identifier.toLowerCase().trim();
  }

  if (channel === "mobile") {
    // Remove all non-digit characters except +
    // This ensures +91 98765 43210 becomes +919876543210
    return identifier.replace(/[^\d+]/g, '').trim();
  }

  return identifier.trim();
}

/**
 * Create and save an OTP
 */
export async function createOTP(
  identifier: string,
  channel: "email" | "mobile",
  purpose: "signup" | "login" | "verification" | "password_reset",
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<string> {

  // Normalize identifier
  const cleanIdentifier = normalizeIdentifier(identifier, channel);

  await connectDB();

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate old OTPs
  await OTP.updateMany(
    { identifier: cleanIdentifier, channel, verified: false },
    { $set: { verified: true } }
  );

  // CREATE NEW OTP
  await OTP.create({
    identifier: cleanIdentifier,
    channel,
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
  // Normalize identifier
  const cleanIdentifier = normalizeIdentifier(identifier, channel);

  await connectDB();

  const codeStr = String(code).trim();

  console.log(`[VerifyOTP] Verifying for: ${cleanIdentifier} (orig: ${identifier}), Channel: ${channel}, Input: ${codeStr}`);
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

  // Find the OTP
  const otp = await OTP.findOne({
    identifier: cleanIdentifier,
    channel,
    code: codeStr,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otp) {
    console.log(`[VerifyOTP] ❌ No matching active OTP found for ${cleanIdentifier} with code ${codeStr}`);

    // Debugging: Check if an OTP exists for this user but with a different code
    const existingOtp = await OTP.findOne({
      identifier: cleanIdentifier,
      channel,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existingOtp) {
      console.log(`[VerifyOTP] ⚠️ Mismatch! Found active OTP: ${existingOtp.code} for ${cleanIdentifier}, but received: ${codeStr}`);
    } else {
      console.log(`[VerifyOTP] ⚠️ No active OTP found at all for ${cleanIdentifier}`);

      // Check for expired OTPs
      const expiredOtp = await OTP.findOne({
        identifier: cleanIdentifier,
        channel,
        code: codeStr,
      }).sort({ createdAt: -1 });

      if (expiredOtp) {
        console.log(`[VerifyOTP] ⚠️ Found EXPIRED OTP for ${cleanIdentifier}. Expired at: ${expiredOtp.expiresAt}`);
        return { success: false, message: "OTP has expired. Please request a new one." };
      }

      // Specific hint for developers/testers in production
      if (process.env.NODE_ENV === "production" && (codeStr === "123456" || codeStr === "12345")) {
        return { success: false, message: "Test OTPs are disabled in production. Set MASTER_OTP env var to enable." };
      }
    }

    return { success: false, message: "Invalid or expired OTP" };
  }

  if (otp.attempts >= 5) {
    console.log(`[VerifyOTP] ❌ Too many attempts for ${cleanIdentifier}`);
    return {
      success: false,
      message: "Too many attempts. Request a new OTP.",
    };
  }

  otp.attempts += 1;
  otp.verified = true;
  await otp.save();

  console.log(`[VerifyOTP] ✅ OTP verified successfully for ${cleanIdentifier}`);
  return { success: true, message: "OTP verified successfully" };
}

/**
 * Rate Limit
 */
export async function checkOTPRateLimit(
  identifier: string,
  channel: "email" | "mobile"
) {
  const cleanIdentifier = normalizeIdentifier(identifier, channel);
  await connectDB();

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const count = await OTP.countDocuments({
    identifier: cleanIdentifier,
    channel,
    createdAt: { $gte: fifteenMinutesAgo },
  });

  if (count >= 5) { // Increased to 5 for better UX
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
  const cleanIdentifier = normalizeIdentifier(identifier, channel);

  await connectDB();
  const codeStr = String(code).trim();

  // Master OTP bypass
  if (process.env.MASTER_OTP && codeStr === process.env.MASTER_OTP) {
    return true;
  }

  // Dev bypass
  if (process.env.NODE_ENV !== "production" && (codeStr === "123456" || codeStr === "12345")) {
    return true;
  }

  const otp = await OTP.findOne({
    identifier: cleanIdentifier,
    channel,
    code: codeStr,
    verified: true, // Look for ALREADY verified
    expiresAt: { $gt: new Date() },
  });

  return !!otp;
}
