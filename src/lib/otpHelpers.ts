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
   Create OTP  (use "type" instead of "channel")
--------------------------------------------------------- */
export async function createOTP(
  identifier: string,
  type: string, // <-- FIXED
  purpose: string,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate old OTPs
  await OTP.updateMany(
    { identifier: cleanIdentifier, type, verified: false },
    { $set: { verified: true } }
  );

  const otp = await OTP.create({
    identifier: cleanIdentifier,
    type, // <-- FIXED
    code,
    expiresAt,
    purpose,
    verified: false,
    metadata: {
      ipAddress: meta?.ipAddress || null,
      userAgent: meta?.userAgent || null,
    },
  });

  return otp.code;
}

/* ---------------------------------------------------------
   Verify OTP  (use "type")
--------------------------------------------------------- */
export async function verifyOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const incoming = code.trim();

  // Master OTP support
  if (process.env.MASTER_OTP && incoming === process.env.MASTER_OTP) {
    return { success: true, message: "Master OTP accepted" };
  }

  // FIND OTP (use type instead of channel)
  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type, // <-- FIXED
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) return { success: false, message: "Invalid or expired OTP" };

  if (otpRecord.code.trim() !== incoming) {
    return { success: false, message: "Invalid OTP" };
  }

  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    return { success: false, message: "Expired OTP" };
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: "OTP verified" };
}

/* ---------------------------------------------------------
   Check if already verified
--------------------------------------------------------- */
export async function checkVerifiedOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();

  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type, // <-- FIXED
    verified: true,
  }).sort({ createdAt: -1 });

  if (!otpRecord) return false;

  return otpRecord.code.trim() === code.trim();
}

/* ---------------------------------------------------------
   Rate limit  (use type)
--------------------------------------------------------- */
export async function checkOTPRateLimit(identifier: string, type: string) {
  await connectDB();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const count = await OTP.countDocuments({
    identifier: cleanIdentifier,
    type, // <-- FIXED
    createdAt: { $gte: oneHourAgo },
  });

  if (count >= 5) {
    return { allowed: false, message: "Too many OTP requests. Try later." };
  }

  return { allowed: true, message: "OK" };
}
