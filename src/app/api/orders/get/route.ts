import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded) return errorResponse('Invalid Token', 401);

        const id = req.nextUrl.searchParams.get('id'); // Assuming query param ?id=... or dynamic route if folder structure was [id]
        // The requested structure is /orders/get/route.ts, so likely using query param ?id=...

        if (!id) return errorResponse('Order ID required', 400);

        const order = await Order.findById(id)
            .populate('items.paper')
            .populate('items.style')
            .populate('items.perfume')
            .populate('items.addons');

        if (!order) return errorResponse('Order not found', 404);

        // Access Control
        if (decoded.role === 'customer' && order.customer.toString() !== decoded.userId) {
            return errorResponse('Forbidden', 403);
        }
        if (decoded.role === 'writer' && order.fulfillment?.assignedWriter?.toString() !== decoded.userId) {
            return errorResponse('Forbidden', 403);
        }
        // QC and Admin can view

        return successResponse({ order });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
