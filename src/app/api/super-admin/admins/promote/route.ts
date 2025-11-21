import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const promoteSchema = z.object({
    email: z.string().email()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = promoteSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { email } = result.data;

        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        ).select('-password');

        if (!user) return errorResponse('User not found', 404);

        return successResponse({ user });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
