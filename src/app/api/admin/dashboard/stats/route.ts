export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
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
            totalOrders,
            activeWriters,
            totalUsers,
            recentLogs
        ] = await Promise.all([
            // Calculate total revenue from non-cancelled, paid orders
            Order.aggregate([
                { $match: { workflowState: { $nin: ['pending_payment', 'cancelled'] } } },
                { $group: { _id: null, total: { $sum: "$price" } } }
            ]),
            // Count total orders
            Order.countDocuments({}),
            // Count active writers
            User.countDocuments({ role: 'writer', isActive: true }),
            // Count total users
            User.countDocuments({}),
            // Fetch recent logs
            AdminActionLog.find().sort({ createdAt: -1 }).limit(5).populate('adminId', 'name email')
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // Return data in the structure expected by the frontend: { stats: ..., recentLogs: ... }
        // Bypassing successResponse wrapper to match frontend code: const data = await response.json(); setStats(data.stats);
        return NextResponse.json({
            stats: {
                totalRevenue,
                totalUsers,
                activeWriters,
                systemStatus: 'Operational'
            },
            recentLogs: recentLogs.map(log => ({
                ...log.toObject(),
                adminId: log.adminId // Ensure populated field is returned
            }))
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return errorResponse(error.message, 500);
    }
}
