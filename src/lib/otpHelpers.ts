import crypto from "crypto";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import connectDB from "./db";

/* ---------------------------------------------------------
   🔹 Generate 6-digit OTP
--------------------------------------------------------- */
export function generateOTPCode(): string {
  if (process.env.MASTER_OTP) {
    return process.env.MASTER_OTP;
  }
  return crypto.randomInt(100000, 999999).toString();
}

/* ---------------------------------------------------------
   🔹 SEND + SAVE OTP
   (You already have this working — unchanged)
--------------------------------------------------------- */
export async function createOTP(identifier: string, channel: string, purpose: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // invalidate old OTPs
  await OTP.updateMany(
    { identifier: cleanIdentifier, channel, verified: false },
    { $set: { verified: true } }
  );

  // create new otp
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
   🔹 VERIFY OTP (MAIN FUNCTION)
   (THIS IS WHAT FIXES YOUR ISSUE)
--------------------------------------------------------- */
export async function verifyOTP(identifier: string, channel: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const incoming = String(code).trim();

  // MASTER OTP support
  if (process.env.MASTER_OTP && incoming === process.env.MASTER_OTP) {
    return { success: true, message: "Master OTP accepted" };
  }

  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    channel,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // FIX: compare against "code"
  const stored = String(otpRecord.code).trim();
  if (incoming !== stored) {
    return { success: false, message: "Invalid OTP" };
  }

  // expiry
  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    return { success: false, message: "Expired OTP" };
  }

  // mark as verified
  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: "OTP verified" };
}

/* ---------------------------------------------------------
   🔹 CHECK ALREADY VERIFIED OTP
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
   🔹 GET VERIFICATION STATUS (optional)
--------------------------------------------------------- */
export async function getVerificationStatus(identifier: string) {
  await connectDB();

  try {
    const user = await User.findOne({ identifier });
    if (!user) return null;

    return {
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
      hasEmail: !!user.email,
      hasPhone: !!user.phone,
    };
  } catch (err) {
    return null;
  }
}
