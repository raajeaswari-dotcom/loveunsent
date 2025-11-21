import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { QCService } from '@/lib/qcService';
import { z } from 'zod';

const rejectSchema = z.object({
    orderId: z.string(),
    reason: z.string().min(5, 'Reason is required'),
    checklist: z.object({
        imageResolution: z.boolean().optional(),
        wordCountMet: z.boolean().optional(),
        spellingCheck: z.boolean().optional(),
        handwritingMatch: z.boolean().optional(),
        perfumeApplied: z.boolean().optional(),
        packagingCorrect: z.boolean().optional()
    }).optional()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'qc' && decoded.role !== 'admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = rejectSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, reason, checklist } = result.data;
        const order = await QCService.rejectOrder(decoded.userId, orderId, reason, checklist);

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
