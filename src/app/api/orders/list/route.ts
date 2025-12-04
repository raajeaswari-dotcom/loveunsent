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

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const skip = (page - 1) * limit;

        let query: any = {};

        // Role-based filtering
        console.log(`🔍 [OrdersList] User Role: ${decoded.role}, User ID: ${decoded.userId}`);

        if (decoded.role === 'customer') {
            query.customerId = decoded.userId;
        } else if (decoded.role === 'writer') {
            query['fulfillment.assignedWriter'] = decoded.userId;
        } else if (decoded.role === 'qc') {
            query.$or = [
                { status: 'review_pending' },
                { 'fulfillment.assignedQC': decoded.userId }
            ];
        }

        console.log(`🔍 [OrdersList] Query:`, JSON.stringify(query));

        // Search
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // Status Filter
        if (status && status !== 'all') {
            const statuses = status.split(',');
            if (statuses.length > 1) {
                query.workflowState = { $in: statuses };
            } else {
                query.workflowState = status;
            }
        }

        // Date Range Filter
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('paperId', 'name')
                .populate('handwritingStyleId', 'name')
                .populate('perfumeId', 'name')
                .lean(),
            Order.countDocuments(query)
        ]);

        return successResponse({
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
