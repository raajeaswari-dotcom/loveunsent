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
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');
        const writerId = searchParams.get('writerId');
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query
        const query: any = {};

        if (status && status !== 'all') {
            query.workflowState = status;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            query['payment.status'] = paymentStatus;
        }

        if (writerId) {
            query.writerId = writerId;
        }

        if (search) {
            query.$or = [
                { _id: { $regex: search, $options: 'i' } },
            ];
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

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [orders, totalCount] = await Promise.all([
            Order.find(query)
                .populate('customerId', 'name email')
                .populate('writerId', 'name')
                .populate('paperId', 'name')
                .populate('perfumeId', 'name')
                .populate('handwritingStyleId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(query)
        ]);

        // Calculate quick stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await Promise.all([
            Order.countDocuments({ workflowState: 'pending_payment' }),
            Order.countDocuments({
                workflowState: { $in: ['assigned', 'writing_in_progress', 'draft_uploaded', 'qc_review'] }
            }),
            Order.countDocuments({
                createdAt: { $gte: today },
                workflowState: 'delivered'
            }),
            Order.aggregate([
                { $match: { createdAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ])
        ]);

        const quickStats = {
            totalOrders: totalCount,
            pendingPayment: stats[0],
            inProgress: stats[1],
            completedToday: stats[2],
            revenueToday: stats[3][0]?.total || 0
        };

        return successResponse({
            orders,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            },
            stats: quickStats
        });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
