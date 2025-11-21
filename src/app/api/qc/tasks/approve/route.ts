import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { QCService } from '@/lib/qcService';
import { z } from 'zod';

const approveSchema = z.object({
    orderId: z.string(),
    comments: z.string().optional()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'qc' && decoded.role !== 'admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = approveSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, comments } = result.data;
        const order = await QCService.approveOrder(decoded.userId, orderId, comments);

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
