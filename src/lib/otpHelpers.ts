import crypto from "crypto";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import connectDB from "./db";

/* ---------------------------------------------------------
   Generate OTP
--------------------------------------------------------- */
export function generateOTPCode(): string {
  if (process.env.MASTER_OTP) return process.env.MASTER_OTP;
  return crypto.randomInt(100000, 999999).toString();
}

/* ---------------------------------------------------------
   Create OTP  (uses `type` to match your DB)
--------------------------------------------------------- */
export async function createOTP(
  identifier: string,
  type: "email" | "mobile",
  purpose: string,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // invalidate older OTPs
  await OTP.updateMany(
    { identifier: cleanIdentifier, type },
    { $set: { verified: true } }
  );

  const otp = await OTP.create({
    identifier: cleanIdentifier,
    type,
    code,
    purpose,
    verified: false,
    expiresAt,
    metadata: {
      ipAddress: meta?.ipAddress || null,
      userAgent: meta?.userAgent || null,
    },
  });

  return otp.code;
}

/* ---------------------------------------------------------
   Verify OTP  (FINAL FIX — removes verified:false)
--------------------------------------------------------- */
export async function verifyOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const incoming = code.trim();

  // MASTER OTP
  if (process.env.MASTER_OTP && incoming === process.env.MASTER_OTP) {
    return { success: true, message: "Master OTP accepted" };
  }

  // FIX: always get latest OTP, regardless of verified status
  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // expiry check
  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    return { success: false, message: "Expired OTP" };
  }

  // compare codes
  if (otpRecord.code.trim() !== incoming) {
    return { success: false, message: "Invalid OTP" };
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: "OTP verified" };
}

/* ---------------------------------------------------------
   Check Verified OTP
--------------------------------------------------------- */
export async function checkVerifiedOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();

  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type,
  }).sort({ createdAt: -1 });

  if (!otpRecord) return false;

  return otpRecord.code.trim() === code.trim();
}

/* ---------------------------------------------------------
   Rate limit: allow max 5 OTPs in 1 hour
--------------------------------------------------------- */
export async function checkOTPRateLimit(identifier: string, type: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const count = await OTP.countDocuments({
    identifier: cleanIdentifier,
    type,
    createdAt: { $gte: oneHourAgo },
  });

  if (count >= 5) {
    return {
      allowed: false,
      message: "Too many OTP requests. Try again later.",
    };
  }

  return { allowed: true, message: "OK" };
}

/* ---------------------------------------------------------
   Get user's verification status
--------------------------------------------------------- */
export async function getVerificationStatus(identifier: string) {
  await connectDB();

  const user = await User.findOne({ identifier: identifier.trim().toLowerCase() });
  if (!user) return null;

  return {
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    hasEmail: !!user.email,
    hasPhone: !!user.phone,
  };
}
