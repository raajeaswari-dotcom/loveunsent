
import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { User } from "../../../../models/User";
import connectDB from "../../../../lib/db";

import { cookies } from "next/headers";

export async function GET(req: Request) {
  await connectDB();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded: any = await verifyToken(token);
    if (!decoded) return NextResponse.json({ user: null });

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).lean() as any;
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return NextResponse.json({ user: null });
  }
}
