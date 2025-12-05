import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { razorpay } from '@/lib/razorpay';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const createPaymentOrderSchema = z.object({
  orderId: z.string() // The DB Order ID
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);

    const decoded: any = verifyToken(token);
    if (!decoded) return errorResponse('Invalid Token', 401);

    // Only customers can create payment orders
    if (decoded.role !== 'customer') {
      return errorResponse('Forbidden: Only customers can make purchases', 403);
    }

    const body = await req.json();
    const result = createPaymentOrderSchema.safeParse(body);
    if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

    const { orderId } = result.data;

    const order = await Order.findById(orderId);
    if (!order) return errorResponse('Order not found', 404);

    // Security check: Ensure user owns the order
    if (order.customerId.toString() !== decoded.userId) {
      return errorResponse('Forbidden', 403);
    }

    // Check if already paid
    if (order.status === 'paid' || order.workflowState === 'paid') {
      return errorResponse('Order already paid', 400);
    }

    // Amount calculation (Double check with DB price to ensure integrity)
    // We use the price already calculated and stored in the order to avoid discrepancies
    const amount = order.price;
    const currency = order.currency || 'INR';

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: currency,
      receipt: `rcpt_${orderId.substring(0, 10)}_${Date.now()}`,
      notes: {
        orderId: order._id.toString(),
        customerId: decoded.userId
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with new Razorpay Order ID (useful for retries)
    order.payment.razorpayOrderId = razorpayOrder.id;
    order.payment.status = 'pending';
    await order.save();

    return successResponse({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      orderId: order._id
    });

  } catch (error: any) {
    console.error('Payment Create Error:', error);
    return errorResponse(error.message, 500);
  }
}
