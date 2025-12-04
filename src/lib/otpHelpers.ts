import crypto from "crypto";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import connectDB from "./db";

/* ---------------------------------------------------------
   Generate OTP
--------------------------------------------------------- */
export function generateOTPCode(): string {
  const masterOtp = process.env.MASTER_OTP;
  if (masterOtp) {
    // Remove ALL whitespace including newlines, tabs, spaces
    const cleaned = masterOtp.replace(/[\s\r\n\t]/g, '');
    console.log(`[OTP] generateOTPCode: Using MASTER_OTP, raw length=${masterOtp.length}, cleaned="${cleaned}", cleanedLength=${cleaned.length}`);
    return cleaned;
  }
  const code = crypto.randomInt(100000, 999999).toString();
  console.log(`[OTP] generateOTPCode: Generated random code="${code}"`);
  return code;
}

/* ---------------------------------------------------------
   Normalize identifier (phone/email) - MUST be consistent everywhere
--------------------------------------------------------- */
function normalizeIdentifier(identifier: string): string {
  // Remove ALL whitespace, newlines, tabs, then lowercase
  return identifier.replace(/[\s\r\n\t]/g, '').trim().toLowerCase();
}

/* ---------------------------------------------------------
   Normalize OTP code - MUST be consistent everywhere
--------------------------------------------------------- */
function normalizeCode(code: string): string {
  // Remove ALL whitespace, keep only digits
  return code.replace(/[\s\r\n\t]/g, '').replace(/\D/g, '');
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

  const cleanIdentifier = normalizeIdentifier(identifier);
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  console.log(`[OTP] createOTP: type="${type}", identifier="${cleanIdentifier}", code="${code}"`);

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

  console.log(`[OTP] createOTP: Created OTP id=${otp._id}`);

  return otp.code;
}

/* ---------------------------------------------------------
   Verify OTP  (with robust MASTER_OTP handling)
--------------------------------------------------------- */
export async function verifyOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = normalizeIdentifier(identifier);
  const incomingCode = normalizeCode(code);

  console.log(`[OTP] verifyOTP START: identifier="${cleanIdentifier}", type="${type}", incomingCode="${incomingCode}"`);

  // MASTER OTP bypass - check FIRST before any DB lookup
  const rawMasterOtp = process.env.MASTER_OTP;
  if (rawMasterOtp) {
    const masterOtp = rawMasterOtp.replace(/[\s\r\n\t]/g, '').replace(/\D/g, '');
    console.log(`[OTP] MASTER_OTP check: rawLength=${rawMasterOtp.length}, cleaned="${masterOtp}", incoming="${incomingCode}"`);
    console.log(`[OTP] MASTER_OTP char codes: master=[${[...masterOtp].map(c => c.charCodeAt(0)).join(',')}], incoming=[${[...incomingCode].map(c => c.charCodeAt(0)).join(',')}]`);

    if (incomingCode === masterOtp) {
      console.log(`[OTP] ✅ MASTER_OTP matched!`);
      return { success: true, message: "Master OTP accepted" };
    } else {
      console.log(`[OTP] ❌ MASTER_OTP did NOT match: "${incomingCode}" !== "${masterOtp}"`);
    }
  } else {
    console.log(`[OTP] No MASTER_OTP set, checking database`);
  }

  // Database lookup
  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    console.log(`[OTP] ❌ No OTP record found for identifier="${cleanIdentifier}", type="${type}"`);
    return { success: false, message: "Invalid or expired OTP" };
  }

  console.log(`[OTP] Found OTP record: id=${otpRecord._id}, storedCode="${otpRecord.code}", verified=${otpRecord.verified}, expiresAt=${otpRecord.expiresAt}`);

  // expiry check
  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    console.log(`[OTP] ❌ OTP expired`);
    return { success: false, message: "Expired OTP" };
  }

  // compare codes (normalize both)
  const storedCode = normalizeCode(otpRecord.code);
  if (storedCode !== incomingCode) {
    console.log(`[OTP] ❌ Code mismatch: stored="${storedCode}" vs incoming="${incomingCode}"`);
    return { success: false, message: "Invalid OTP" };
  }

  otpRecord.verified = true;
  await otpRecord.save();

  console.log(`[OTP] ✅ OTP verified successfully`);
  return { success: true, message: "OTP verified" };
}

/* ---------------------------------------------------------
   Check Verified OTP (for retry handling)
--------------------------------------------------------- */
export async function checkVerifiedOTP(identifier: string, type: string, code: string) {
  await connectDB();

  const cleanIdentifier = normalizeIdentifier(identifier);
  const incomingCode = normalizeCode(code);

  const otpRecord = await OTP.findOne({
    identifier: cleanIdentifier,
    type,
  }).sort({ createdAt: -1 });

  if (!otpRecord) return false;

  const storedCode = normalizeCode(otpRecord.code);
  return otpRecord.verified === true && storedCode === incomingCode;
}

/* ---------------------------------------------------------
   Rate limit: allow max 5 OTPs in 1 hour
--------------------------------------------------------- */
export async function checkOTPRateLimit(identifier: string, type: string) {
  await connectDB();

  const cleanIdentifier = normalizeIdentifier(identifier);
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

  const user = await User.findOne({ identifier: normalizeIdentifier(identifier) });
  if (!user) return null;

  return {
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    hasEmail: !!user.email,
    hasPhone: !!user.phone,
  };
}
