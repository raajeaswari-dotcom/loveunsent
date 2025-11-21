import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { AdminService } from '@/lib/adminService';
import { writerActionSchema } from '@/lib/adminValidators';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = writerActionSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { writerId, action, reason } = result.data;

        let user;
        if (action === 'approve') {
            user = await AdminService.approveWriter(decoded.userId, writerId);
        } else {
            if (!reason) return errorResponse('Reason required for rejection', 400);
            user = await AdminService.rejectWriter(decoded.userId, writerId, reason);
        }

        return successResponse({ user });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
