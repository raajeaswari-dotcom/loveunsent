import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const qcRejectSchema = z.object({
    orderId: z.string(),
    feedback: z.string()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'qc' && decoded.role !== 'admin')) {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = qcRejectSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, feedback } = result.data;

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'changes_requested',
                'fulfillment.qcFeedback': feedback,
                'fulfillment.assignedQC': decoded.userId
            },
            { new: true }
        );

        if (!order) return errorResponse('Order not found', 404);

        // TODO: Notify Writer

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
