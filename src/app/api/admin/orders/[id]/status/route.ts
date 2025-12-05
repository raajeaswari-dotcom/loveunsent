
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { AdminActionLog } from '@/models/AdminActionLog';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const token = req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload: any = verifyToken(token);
        if (!payload || !['super_admin', 'admin'].includes(payload.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { success: false, message: 'Status is required' },
                { status: 400 }
            );
        }

        const order = await Order.findById(params.id);
        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        const oldStatus = order.workflowState;
        order.workflowState = status;

        // Update timestamp based on status
        if (status === 'shipped') {
            order.shippedAt = new Date();
        } else if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        // Log action
        await AdminActionLog.create({
            adminId: payload.userId,
            action: 'UPDATE_ORDER_STATUS',
            targetId: order._id,
            targetModel: 'Order',
            payload: { oldStatus, newStatus: status },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
        });

        return NextResponse.json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                workflowState: order.workflowState
            }
        });

    } catch (error: any) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update order status' },
            { status: 500 }
        );
    }
}
