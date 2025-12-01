import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "DEV_SECRET";

// Generate JWT
export function signJwt(payload: object, expiresIn: string | number = "7d") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
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
