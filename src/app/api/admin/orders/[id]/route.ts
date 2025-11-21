import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(
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
        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const order: any = await Order.findById(params.id)
            .populate('customerId', 'name email phone')
            .populate('writerId', 'name email')
            .populate('paperId', 'name price')
            .populate('perfumeId', 'name price')
            .populate('handwritingStyleId', 'name')
            .lean();

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Role-based access control
        if (payload.role === 'customer' && order.customerId?._id.toString() !== payload.userId) {
            return NextResponse.json(
                { success: false, message: 'Forbidden' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error: any) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}
