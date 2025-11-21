import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Verify authentication and role
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (payload.role !== 'admin' && payload.role !== 'super_admin') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const format = searchParams.get('format') || 'csv';
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query (same as list endpoint)
        const query: any = {};

        if (status && status !== 'all') {
            query.workflowState = status;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            query['payment.status'] = paymentStatus;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Fetch orders
        const orders = await Order.find(query)
            .populate('customerId', 'name email phone')
            .populate('writerId', 'name email')
            .populate('paperId', 'name price')
            .populate('perfumeId', 'name price')
            .populate('handwritingStyleId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        if (format === 'csv') {
            // Generate CSV
            const headers = [
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Order Date',
                'Status',
                'Payment Status',
                'Amount (₹)',
                'Writer',
                'Tracking ID',
                'Courier',
                'Requested Delivery',
            ];

            const rows = orders.map((order: any) => [
                order._id.toString(),
                order.customerId?.name || 'N/A',
                order.customerId?.email || 'N/A',
                new Date(order.createdAt).toLocaleDateString('en-IN'),
                order.workflowState,
                order.payment?.status || 'N/A',
                order.price,
                order.writerId?.name || 'Unassigned',
                order.trackingId || 'N/A',
                order.courierPartner || 'N/A',
                order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString('en-IN') : 'N/A',
            ]);

            const csv = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="orders-export-${Date.now()}.csv"`,
                },
            });
        }

        return NextResponse.json(
            { success: false, message: 'Unsupported format' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Error exporting orders:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to export orders' },
            { status: 500 }
        );
    }
}
