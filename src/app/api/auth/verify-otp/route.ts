import { NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/auth';
import { validateOtpAndGetUser } from '@/lib/otp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, otp } = body; // identifier = email or phone

    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Missing identifier or otp' }, { status: 400 });
    }

    const user = await validateOtpAndGetUser(identifier, otp);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
    setAuthCookie(res, user);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
