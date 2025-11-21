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
        if (!decoded || decoded.role !== 'writer') {
            return errorResponse('Forbidden', 403);
        }

        const writerId = decoded.userId;

        // Parallelize data fetching
        const [
            activeTasksCount,
            completedThisWeekCount,
            pendingReviewCount,
            activeTasks
        ] = await Promise.all([
            // Active Tasks: assigned or writing_in_progress
            Order.countDocuments({
                'fulfillment.assignedWriter': writerId,
                workflowState: { $in: ['assigned', 'writing_in_progress'] }
            }),
            // Completed This Week: delivered or shipped (assuming completed means done by writer)
            // Actually, for writer, "completed" usually means passed to QC or shipped.
            // Let's count orders where writer is assigned and status is beyond writing.
            Order.countDocuments({
                'fulfillment.assignedWriter': writerId,
                workflowState: { $in: ['draft_uploaded', 'qc_review', 'qc_approved', 'order_packed', 'order_shipped', 'delivered'] },
                updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            // Pending Review: draft_uploaded or qc_review
            Order.countDocuments({
                'fulfillment.assignedWriter': writerId,
                workflowState: { $in: ['draft_uploaded', 'qc_review'] }
            }),
            // Fetch active tasks details
            Order.find({
                'fulfillment.assignedWriter': writerId,
                workflowState: { $in: ['assigned', 'writing_in_progress', 'changes_requested'] }
            })
                .select('orderId workflowState paperId handwritingStyleId createdAt')
                .populate('paperId', 'name')
                .populate('handwritingStyleId', 'name')
                .sort({ createdAt: 1 })
        ]);

        return successResponse({
            stats: {
                activeTasks: activeTasksCount,
                completedThisWeek: completedThisWeekCount,
                pendingReview: pendingReviewCount
            },
            tasks: activeTasks.map(task => ({
                id: task.orderId || task._id,
                status: task.workflowState,
                paper: task.paperId?.name || 'Standard',
                style: task.handwritingStyleId?.name || 'Standard',
                dueDate: new Date(new Date(task.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() // Mock due date: 3 days after creation
            }))
        });

    } catch (error: any) {
        console.error('Writer dashboard stats error:', error);
        return errorResponse(error.message, 500);
    }
}
