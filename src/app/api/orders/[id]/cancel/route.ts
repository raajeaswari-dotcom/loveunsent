import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        const userId = authResult.user.userId;

        // Find order and verify ownership
        const order = await dbConnect();
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify the order belongs to the authenticated user
        if (foundOrder.customer.toString() !== userId) {
            return NextResponse.json(
                { error: 'You can only cancel your own orders' },
                { status: 403 }
            );
        }

        // Check if order can be cancelled (only pending payment or recently paid)
        const cancellableStatuses = ['payment_pending', 'payment_completed'];
        if (!cancellableStatuses.includes(foundOrder.workflowStatus)) {
            return NextResponse.json(
                { error: 'This order cannot be cancelled. Please contact support.' },
                { status: 400 }
            );
        }

        // Update order status to cancelled
        foundOrder.workflowStatus = 'cancelled';
        foundOrder.paymentStatus = 'refunded'; // If payment was made, mark for refund
        await foundOrder.save();

        // TODO: Trigger refund process if payment was completed
        // TODO: Send cancellation email notification

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
            order: foundOrder,
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { error: 'Failed to cancel order' },
            { status: 500 }
        );
    }
}
