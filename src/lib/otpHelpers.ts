import crypto from "crypto";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import connectDB from "./db";

/* ---------------------------------------------------------
   Generate OTP
--------------------------------------------------------- */
export function generateOTPCode(): string {
  // MASTER_OTP bypass - trim to remove any whitespace from env var
  if (process.env.MASTER_OTP) {
    const masterCode = process.env.MASTER_OTP.trim();
    console.log(`[OTP] Using MASTER_OTP: "${masterCode}"`);
    return masterCode;
  }
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

  // Normalize identifier - remove spaces, lowercase
  const cleanIdentifier = identifier.replace(/\s+/g, '').trim().toLowerCase();
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  console.log(`[OTP] Creating OTP for ${type}: identifier="${cleanIdentifier}", code="${code}"`);

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

  console.log(`[OTP] Created OTP record: id=${otp._id}, identifier="${cleanIdentifier}", code="${code}"`);

  return otp.code;
}

/* ---------------------------------------------------------
   Verify OTP  (FINAL FIX — with MASTER_OTP bypass)
--------------------------------------------------------- */
export async function verifyOTP(identifier: string, type: string, code: string) {
  await connectDB();

  // Normalize identifier - remove spaces, lowercase (same as createOTP)
  const cleanIdentifier = identifier.replace(/\s+/g, '').trim().toLowerCase();
  const incoming = code.trim();

  console.log(`[OTP] Verifying: identifier="${cleanIdentifier}", type="${type}", incoming="${incoming}"`);

  // MASTER OTP bypass - check this FIRST before any DB lookup
  const masterOtp = process.env.MASTER_OTP ? process.env.MASTER_OTP.trim() : null;
  if (masterOtp) {
    console.log(`[OTP] MASTER_OTP is set: "${masterOtp}", comparing with incoming: "${incoming}"`);
    if (incoming === masterOtp) {
      console.log(`[OTP] ✅ MASTER_OTP matched!`);
      return { success: true, message: "Master OTP accepted" };
    } else {
      console.log(`[OTP] ❌ MASTER_OTP did NOT match. incoming="${incoming}" vs master="${masterOtp}"`);
    }
  }

  // FIX: always get latest OTP, regardless of verified status
  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type,
  }).sort({ createdAt: -1 });

  console.log(`[OTP] DB lookup result:`, otpRecord ? {
    id: otpRecord._id,
    code: otpRecord.code,
    verified: otpRecord.verified,
    expiresAt: otpRecord.expiresAt
  } : 'NOT FOUND');

  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // expiry check
  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    console.log(`[OTP] ❌ OTP expired`);
    return { success: false, message: "Expired OTP" };
  }

  // compare codes
  if (otpRecord.code.trim() !== incoming) {
    console.log(`[OTP] ❌ Code mismatch: stored="${otpRecord.code.trim()}" vs incoming="${incoming}"`);
    return { success: false, message: "Invalid OTP" };
  }

  otpRecord.verified = true;
  await otpRecord.save();

  console.log(`[OTP] ✅ OTP verified successfully`);
  return { success: true, message: "OTP verified" };
}

/* ---------------------------------------------------------
   Check Verified OTP
--------------------------------------------------------- */
export async function checkVerifiedOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.replace(/\s+/g, '').trim().toLowerCase();

  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type,
  }).sort({ createdAt: -1 });

  if (!otpRecord) return false;

  // Must be marked as verified AND match the code
  return otpRecord.verified === true && otpRecord.code.trim() === code.trim();
}

/* ---------------------------------------------------------
   Rate limit: allow max 5 OTPs in 1 hour
--------------------------------------------------------- */
export async function checkOTPRateLimit(identifier: string, type: string) {
  await connectDB();

  const cleanIdentifier = identifier.replace(/\s+/g, '').trim().toLowerCase();
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

  const user = await User.findOne({ identifier: identifier.replace(/\s+/g, '').trim().toLowerCase() });
  if (!user) return null;

  return {
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    hasEmail: !!user.email,
    hasPhone: !!user.phone,
  };
}
