export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { AdminActionLog } from '@/models/AdminActionLog';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
            return errorResponse('Forbidden', 403);
        }

        // Parallelize data fetching for performance
        const [
            totalRevenueResult,
            totalUsers,
            activeWriters,
            recentLogs,
            orderStats
        ] = await Promise.all([
            // Calculate total revenue from non-cancelled, paid orders
            Order.aggregate([
                { $match: { workflowState: { $nin: ['pending_payment', 'cancelled'] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            // Count total users
            User.countDocuments({}),
            // Count active writers
            User.countDocuments({ role: 'writer', isActive: true }),
            // Fetch recent admin logs
            AdminActionLog.find().sort({ createdAt: -1 }).limit(5).populate('adminId', 'name email'),
            // Get order status breakdown
            Order.aggregate([
                { $group: { _id: "$workflowState", count: { $sum: 1 } } }
            ])
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        return successResponse({
            stats: {
                totalRevenue,
                totalUsers,
                activeWriters,
                systemStatus: 'Healthy', // Placeholder for now
            },
            recentLogs,
            orderStats
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return errorResponse(error.message, 500);
    }
}
