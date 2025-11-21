import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return errorResponse('Validation Error', 400, result.error.format());
        }

        const { email, password } = result.data;

        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse('Invalid credentials', 401);
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return errorResponse('Invalid credentials', 401);
        }

        const token = signToken({ userId: user._id, role: user.role });

        const response = successResponse({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
        response.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });

        return response;
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
