import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";

export async function validateOtpAndGetUser(identifier: string, otp: string) {
  await dbConnect();

  const incomingOtp = String(otp).trim();

  // 1. Find latest unverified OTP for this identifier
  const otpEntry = await OTP.findOne({
    identifier,
    verified: false
  }).sort({ createdAt: -1 });

  if (!otpEntry) return null;

  const storedOtp = String(otpEntry.code).trim(); // FIXED FIELD NAME

  // 2. Compare OTP
  if (incomingOtp !== storedOtp) {
    console.log("OTP mismatch", { incomingOtp, storedOtp });
    return null;
  }

  // 3. Check expiry
  const now = Date.now();
  const expiresAt = new Date(otpEntry.expiresAt).getTime();

  if (now > expiresAt) {
    console.log("OTP expired");
    await OTP.updateMany({ identifier }, { $set: { verified: true } });
    return null;
  }

  // 4. Find or create user
  let user = await User.findOne({ identifier });

  if (!user) {
    user = await User.create({
      identifier,
      email: identifier.includes("@") ? identifier : undefined,
      phone: identifier.startsWith("+") ? identifier : undefined,
      role: "customer",
    });
  }

  // 5. Mark OTP as used
  otpEntry.verified = true;
  await otpEntry.save();

  // Cleanup other OTPs
  await OTP.updateMany({ identifier }, { $set: { verified: true } });

  return user;
}
