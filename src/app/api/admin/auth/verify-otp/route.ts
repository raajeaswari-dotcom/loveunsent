import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";
import { validateOtpAndGetUser } from "@/lib/otp";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { identifier, otp } = body;

  const user = await validateOtpAndGetUser(identifier, otp);

  if (!user) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  // Admin-only check
  if (!["admin", "writer", "qc", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 403 });
  }

  const res = NextResponse.json({ success: true, role: user.role });
  setAuthCookie(res, user);
  return res;
}