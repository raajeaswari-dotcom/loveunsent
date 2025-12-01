
import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { User } from "../../../../models/User";
import connectDB from "../../../../lib/db";

export async function GET(req: Request) {
  await connectDB();

  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded: any = await verifyToken(token);
    if (!decoded) return NextResponse.json({ user: null });

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return NextResponse.json({ user: null });
  }
}
