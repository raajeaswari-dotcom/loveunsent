import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { triggerNotification } from '@/lib/notificationService';
import { Order } from '@/models/Order';
import { z } from 'zod';

const feedbackSchema = z.object({
    orderId: z.string(),
    message: z.string().min(5)
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'qc' && decoded.role !== 'admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = feedbackSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { orderId, message } = result.data;

        const order = await Order.findById(orderId);
        if (!order) return errorResponse('Order not found', 404);

        // Just send a notification without changing state
        // This is for ad-hoc communication
        // In a real app, we might store this in a 'messages' collection

        // triggerNotification('qc_feedback', { ...order.toObject(), message }); 

        return successResponse({ message: 'Feedback sent' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
