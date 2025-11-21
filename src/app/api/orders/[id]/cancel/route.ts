import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        // Verify authentication
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const { id } = params;
        const userId = decoded.userId;

        // Find order and verify ownership
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify the order belongs to the authenticated user
        if (foundOrder.customerId.toString() !== userId) {
            return NextResponse.json(
                { error: 'You can only cancel your own orders' },
                { status: 403 }
            );
        }

        // Check if order can be cancelled (only pending payment or recently paid)
        const cancellableStatuses = ['pending_payment', 'paid'];
        if (!cancellableStatuses.includes(foundOrder.workflowState)) {
            return NextResponse.json(
                { error: 'This order cannot be cancelled. Please contact support.' },
                { status: 400 }
            );
        }

        // Update order status to cancelled
        foundOrder.workflowState = 'cancelled';
        if (foundOrder.payment?.status === 'captured') {
            foundOrder.payment.status = 'pending'; // Mark for refund
        }
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
