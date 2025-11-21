import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { QCService } from '@/lib/qcService';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'qc' && decoded.role !== 'admin')) return errorResponse('Forbidden', 403);

        const tasks = await QCService.getPendingTasks(decoded.userId);

        return successResponse({ tasks });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
