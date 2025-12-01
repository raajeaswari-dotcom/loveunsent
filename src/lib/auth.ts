import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "DEV_SECRET";

// Generate JWT
export function signJwt(payload: object, expiresIn: string = "7d") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export const signToken = signJwt; // Alias for backward compatibility

// Verify JWT
export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

// Set authentication cookie
export function setAuthCookie(response: NextResponse, user: any) {
    const token = signJwt({
        userId: user._id || user.id,
        role: user.role,
        email: user.email
    });

    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
}
