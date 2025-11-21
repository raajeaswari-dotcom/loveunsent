import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const trackingSchema = z.object({
    orderId: z.string(),
    trackingId: z.string(),
    courierPartner: z.string()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = trackingSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, trackingId, courierPartner } = result.data;

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'shipped',
                'fulfillment.trackingId': trackingId,
                'fulfillment.courierPartner': courierPartner,
                'fulfillment.shippedAt': new Date()
            },
            { new: true }
        );

        if (!order) return errorResponse('Order not found', 404);

        // TODO: Notify Customer

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
