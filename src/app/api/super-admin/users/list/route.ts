import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Auth Error: Missing Token', 401);

        const decoded: any = verifyToken(token);
        if (!decoded) return errorResponse('Auth Error: Invalid Token', 401);

        if (decoded.role !== 'super_admin') {
            return errorResponse(`Auth Error: Role mismatch (${decoded.role})`, 403);
        }

        const users = await User.find({})
            .select('-passwordHash')
            .sort({ createdAt: -1 });

        return successResponse({ users, currentUserId: decoded.userId });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
