import crypto from "crypto";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import connectDB from "./db";

/* ---------------------------------------------------------
   🔹 Generate 6-digit OTP (supports master OTP)
--------------------------------------------------------- */
export function generateOTPCode(): string {
  if (process.env.MASTER_OTP) {
    return process.env.MASTER_OTP;
  }
  return crypto.randomInt(100000, 999999).toString();
}

/* ---------------------------------------------------------
   🔹 Create + Save new OTP
--------------------------------------------------------- */
export async function createOTP(identifier: string, channel: string, purpose: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate previous OTPs
  await OTP.updateMany(
    { identifier: cleanIdentifier, channel, verified: false },
    { $set: { verified: true } }
  );

  // Create new OTP
  const otp = await OTP.create({
    identifier: cleanIdentifier,
    channel,
    code,
    expiresAt,
    purpose,
    verified: false,
  });

  return otp.code;
}

/* ---------------------------------------------------------
   🔹 Verify OTP (MAIN FUNCTION) — FIXED COMPLETELY
--------------------------------------------------------- */
export async function verifyOTP(identifier: string, channel: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const incoming = String(code).trim();

  // MASTER OTP
  if (process.env.MASTER_OTP && incoming === process.env.MASTER_OTP) {
    return { success: true, message: "Master OTP accepted" };
  }

  // Find latest unverified OTP
  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    channel,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // Compare with correct field: "code"
  const stored = String(otpRecord.code).trim();
  if (incoming !== stored) {
    return { success: false, message: "Invalid OTP" };
  }

  // Expiry check
  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    return { success: false, message: "Expired OTP" };
  }

  // Mark as verified
  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: "OTP verified" };
}

/* ---------------------------------------------------------
   🔹 Check if OTP was already verified (for resubmits)
--------------------------------------------------------- */
export async function checkVerifiedOTP(identifier: string, channel: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const incoming = String(code).trim();

  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    channel,
    verified: true,
  }).sort({ createdAt: -1 });

  if (!otpRecord) return false;

  return String(otpRecord.code).trim() === incoming;
}

/* ---------------------------------------------------------
   🔹 Rate Limit — Allow MAX 5 OTPs per hour per identifier
--------------------------------------------------------- */
export async function checkOTPRateLimit(identifier: string, channel: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const count = await OTP.countDocuments({
    identifier: cleanIdentifier,
    channel,
    createdAt: { $gte: oneHourAgo },
  });

  if (count >= 5) {
    return {
      allowed: false,
      message: "Too many OTP requests. Please try again later.",
    };
  }

  return {
    allowed: true,
    message: "OK",
  };
}

/* ---------------------------------------------------------
   🔹 OPTIONAL: Get verification status
--------------------------------------------------------- */
export async function getVerificationStatus(identifier: string) {
  await connectDB();

  const user = await User.findOne({ identifier });
  if (!user) return null;

  return {
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    hasEmail: !!user.email,
    hasPhone: !!user.phone,
  };
}
