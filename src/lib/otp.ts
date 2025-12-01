import OTP from "@/src/models/OTP";
import User from "@/src/models/User";
import dbConnect from "@/src/lib/dbConnect";

export async function validateOtpAndGetUser(identifier: string, otp: string) {
  await dbConnect();

  // 1. Lookup OTP entry
  const otpEntry = await OTP.findOne({ identifier }).sort({ createdAt: -1 });

  if (!otpEntry) return null;

  // 2. Expired OTP?
  const now = Date.now();
  const expiresAt = new Date(otpEntry.expiresAt).getTime();

  if (now > expiresAt) {
    await OTP.deleteOne({ _id: otpEntry._id });
    return null;
  }

  // 3. OTP mismatch
  if (String(otpEntry.code) !== String(otp)) {
    return null;
  }

  // 4. Get or create user
  let user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }, { identifier }] });

  if (!user) {
    // New user signup via OTP
    user = await User.create({
      identifier,
      email: identifier.includes("@") ? identifier : undefined,
      phone: identifier.startsWith("+") ? identifier : undefined,
      role: "customer"
    });
  }

  // 5. Delete OTP after success (security best practice)
  await OTP.deleteMany({ identifier });

  return user;
}