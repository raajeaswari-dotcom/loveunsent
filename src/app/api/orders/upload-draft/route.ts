import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const uploadDraftSchema = z.object({
    orderId: z.string(),
    imageUrl: z.string().url()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'writer') {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = uploadDraftSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, imageUrl } = result.data;

        // Verify assignment
        const orderCheck = await Order.findById(orderId);
        if (!orderCheck) return errorResponse('Order not found', 404);
        if (orderCheck.fulfillment.assignedWriter.toString() !== decoded.userId) {
            return errorResponse('Not assigned to this order', 403);
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                'fulfillment.writerSubmissionUrl': imageUrl,
                status: 'review_pending'
            },
            { new: true }
        );

        // TODO: Notify QC

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
