import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { WriterService } from '@/lib/writerService';
import { z } from 'zod';

const acceptTaskSchema = z.object({
    orderId: z.string()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'writer') return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = acceptTaskSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId } = result.data;
        const order = await WriterService.acceptTask(orderId, decoded.userId);

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
