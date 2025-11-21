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
        if (!decoded || decoded.role !== 'qc') {
            return errorResponse('Forbidden', 403);
        }

        // Parallelize data fetching
        const [
            pendingReviewsCount,
            approvedTodayCount,
            rejectedTodayCount,
            priorityReviews
        ] = await Promise.all([
            // Pending Reviews: qc_review
            Order.countDocuments({ workflowState: 'qc_review' }),
            // Approved Today: qc_approved
            Order.countDocuments({
                workflowState: 'qc_approved',
                updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            // Rejected Today: changes_requested
            Order.countDocuments({
                workflowState: 'changes_requested',
                updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            // Priority Reviews: oldest qc_review orders
            Order.find({ workflowState: 'qc_review' })
                .select('orderId workflowState createdAt')
                .sort({ createdAt: 1 })
                .limit(5)
        ]);

        return successResponse({
            stats: {
                pendingReviews: pendingReviewsCount,
                approvedToday: approvedTodayCount,
                rejectedToday: rejectedTodayCount,
                avgReviewTime: '5m' // Placeholder, hard to calculate without detailed logs
            },
            priorityReviews: priorityReviews.map(order => ({
                id: order.orderId || order._id,
                uploadedAt: order.createdAt // Using createdAt as proxy for upload time if not tracked separately
            })),
            recentActivity: [] // Placeholder, would need AdminActionLog filtering
        });

    } catch (error: any) {
        console.error('QC dashboard stats error:', error);
        return errorResponse(error.message, 500);
    }
}
