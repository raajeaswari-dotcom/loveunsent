import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "DEV_SECRET");

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

// PUBLIC pages (no login required)
const PUBLIC_PATHS = [
  "/",  // Homepage
  "/auth",  // New unified auth page
  "/login",
  "/register",
  "/admin/login",
  "/our-collection",
  "/customize",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/email/send-otp",
  "/api/auth/email/verify-otp",
  "/api/auth/mobile/send-otp",
  "/api/auth/mobile/verify-otp",
  "/api/auth/debug",  // Debug endpoint
  "/api/auth/otp-debug",  // OTP debug endpoint
  "/api/auth/test-verify",  // Test verify endpoint
  "/api/debug/collections", // Debug collections endpoint
  "/api/admin/auth/verify-otp",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/products",  // Public product APIs
  "/_next",
  "/favicon.ico",
  "/static",
  "/images",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const decoded: any = await verifyToken(token);
  if (!decoded) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-based protection
  if (path.startsWith("/admin") && decoded.role !== "admin" && decoded.role !== "super_admin") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/writer") && decoded.role !== "writer") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/qc") && decoded.role !== "qc") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/super-admin") && decoded.role !== "super_admin") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
