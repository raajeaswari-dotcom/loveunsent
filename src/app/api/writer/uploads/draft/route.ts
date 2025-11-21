import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { WriterService } from '@/lib/writerService';
import { z } from 'zod';

const uploadDraftSchema = z.object({
    orderId: z.string(),
    fileUrl: z.string().url()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'writer') return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = uploadDraftSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, fileUrl } = result.data;
        const order = await WriterService.uploadDraft(orderId, decoded.userId, fileUrl);

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
