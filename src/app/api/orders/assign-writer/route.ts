import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';
import { triggerNotification } from '@/lib/notificationService';

const assignSchema = z.object({
    orderId: z.string(), // DB _id
    writerId: z.string()
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
        const result = assignSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, writerId } = result.data;

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                'fulfillment.assignedWriter': writerId,
                status: 'assigned'
            },
            { new: true }
        );

        if (!order) return errorResponse('Order not found', 404);

        // Notify Customer (Writer Assigned)
        triggerNotification('writer_assigned', order).catch(console.error);

        // TODO: Notify Writer specifically (could extend triggerNotification for this)

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
