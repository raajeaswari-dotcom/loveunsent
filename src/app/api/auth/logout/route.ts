import { NextResponse } from "next/server";

export function GET() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/"
  });
  return res;
}