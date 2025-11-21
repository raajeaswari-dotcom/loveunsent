import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded) return errorResponse('Invalid Token', 401);

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return errorResponse('User not found', 404);

        return successResponse({ user });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
