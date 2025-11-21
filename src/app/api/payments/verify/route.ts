import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return errorResponse('Missing required payment details', 400);
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return errorResponse('Server Payment Configuration Error', 500);

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Signature is valid
            const order = await Order.findOne({ 'payment.razorpayOrderId': razorpay_order_id });

            if (!order) {
                return errorResponse('Order not found', 404);
            }

            // Update Order Status
            // Move to 'paid' and workflow to 'paid' (or 'assigned' if auto-assign logic existed here, but usually 'paid' first)
            order.status = 'paid';
            order.workflowState = 'paid';
            order.payment.razorpayPaymentId = razorpay_payment_id;
            order.payment.status = 'captured';
            order.payment.paidAt = new Date();

            await order.save();

            return successResponse({
                success: true,
                message: 'Payment verified and order confirmed',
                orderId: order._id
            });
        } else {
            return errorResponse('Invalid Signature', 400);
        }
    } catch (error: any) {
        console.error('Payment Verify Error:', error);
        return errorResponse(error.message, 500);
    }
}
