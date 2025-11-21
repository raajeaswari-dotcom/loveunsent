import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';
import { triggerNotification } from '@/lib/notificationService';

const statusSchema = z.object({
    orderId: z.string(),
    status: z.enum([
        'packed',
        'shipped',
        'delivered',
        'cancelled'
    ])
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = statusSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, status } = result.data;

        const updateData: any = {
            status: status,
            workflowState: status
        };

        if (status === 'shipped') updateData['fulfillment.shippedAt'] = new Date();
        if (status === 'delivered') updateData['fulfillment.deliveredAt'] = new Date();

        const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        if (!order) return errorResponse('Order not found', 404);

        if (status === 'shipped') {
            triggerNotification('shipped', order).catch(console.error);
        } else if (status === 'delivered') {
            triggerNotification('delivered', order).catch(console.error);
        }

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
