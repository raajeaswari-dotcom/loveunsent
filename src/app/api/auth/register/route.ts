import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['customer', 'writer', 'qc', 'admin']).optional() // Allow role selection for demo/admin creation, usually restricted
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return errorResponse('Validation Error', 400, result.error.format());
        }

        const { name, email, password, role } = result.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse('User already exists', 409);
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });

        const token = signToken({ userId: user._id, role: user.role });

        const response = successResponse({ user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
        response.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: false,
            domain: 'localhost'
        });

        return response;
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
