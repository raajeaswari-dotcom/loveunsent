import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';
import { triggerNotification } from '@/lib/notificationService';

const qcActionSchema = z.object({
    orderId: z.string()
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
        const result = qcActionSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId } = result.data;

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'approved',
                'fulfillment.assignedQC': decoded.userId
            },
            { new: true }
        );

        if (!order) return errorResponse('Order not found', 404);

        // Notify Customer (QC Completed)
        triggerNotification('qc_completed', order).catch(console.error);

        // TODO: Notify Admin for packing

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
