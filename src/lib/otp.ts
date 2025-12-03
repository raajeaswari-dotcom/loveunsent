import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";

export async function validateOtpAndGetUser(identifier: string, otp: string) {
  await dbConnect();

  const incomingOtp = String(otp).trim();

  // NORMALIZE IDENTIFIER EXACTLY LIKE otpHelpers.ts
  const cleanIdentifier = identifier.trim().toLowerCase();

  // FIND LATEST OTP (MUST MATCH CHANNEL + VERIFIED:false)
  const otpEntry = await OTP.findOne({
    identifier: cleanIdentifier,
    verified: false,            // MUST MATCH
    channel: "email"            // IMPORTANT (you are using email OTP)
  }).sort({ createdAt: -1 });

  if (!otpEntry) return null;

  // MATCH OTP
  const storedOtp = String(otpEntry.code).trim();
  if (incomingOtp !== storedOtp) return null;

  // CHECK EXPIRY
  const now = Date.now();
  const exp = new Date(otpEntry.expiresAt).getTime();
  if (now > exp) {
    await OTP.updateMany({ identifier: cleanIdentifier }, { $set: { verified: true } });
    return null;
  }

  // USER FETCH / CREATE
  let user = await User.findOne({ identifier: cleanIdentifier });
  if (!user) {
    user = await User.create({
      identifier: cleanIdentifier,
      email: cleanIdentifier.includes("@") ? cleanIdentifier : undefined,
      phone: cleanIdentifier.startsWith("+") ? cleanIdentifier : undefined,
      role: "customer",
    });
  }

  // MARK OTP USED
  otpEntry.verified = true;
  await otpEntry.save();

  return user;
}
