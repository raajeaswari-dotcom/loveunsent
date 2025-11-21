import { AnalyticsEvent } from '@/models/AnalyticsEvent';
import { Order } from '@/models/Order';
import { User } from '@/models/User';

export const AnalyticsService = {
    async getOverviewStats() {
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'pending_payment'] } } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const activeOrders = await Order.countDocuments({
            status: { $in: ['paid', 'assigned', 'writing_in_progress', 'qc_review', 'approved', 'packed'] }
        });

        const pendingQC = await Order.countDocuments({ workflowState: 'qc_review' });

        const totalOrders = await Order.countDocuments({});

        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            activeOrders,
            pendingQC,
            totalOrders
        };
    },

    async getRevenueTrend(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $nin: ['cancelled', 'pending_payment'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    },

    async getWriterPerformance() {
        // Aggregating from Orders directly for now (could use AnalyticsEvent for more granular turnaround time)
        return await Order.aggregate([
            { $match: { 'fulfillment.assignedWriter': { $exists: true } } },
            {
                $group: {
                    _id: '$fulfillment.assignedWriter',
                    totalAssigned: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $in: ['$status', ['shipped', 'delivered']] }, 1, 0] }
                    },
                    // Mock rating for now as it's not in Order schema explicitly yet, or assume it's added
                    avgRating: { $avg: '$rating' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'writer'
                }
            },
            { $unwind: '$writer' },
            {
                $project: {
                    writerName: '$writer.name',
                    totalAssigned: 1,
                    completed: 1,
                    avgRating: { $ifNull: ['$avgRating', 0] }
                }
            }
        ]);
    },

    async getOrdersTrend() {
        // By Paper Type
        const byPaper = await Order.aggregate([
            { $group: { _id: '$paperId', count: { $sum: 1 } } },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'paper' } }, // Assuming Paper is in products/papers collection
            { $unwind: { path: '$paper', preserveNullAndEmptyArrays: true } },
            { $project: { name: '$paper.name', count: 1 } }
        ]);

        return { byPaper };
    },

    async exportOrdersToCSV(startDate: Date, endDate: Date) {
        const orders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('customerId', 'name email').lean();

        // Simple CSV generation
        const header = 'Order ID,Customer Name,Email,Status,Price,Date\n';
        const rows = orders.map((o: any) => {
            return `${o._id},"${o.customerId?.name || ''}","${o.customerId?.email || ''}",${o.status},${o.price},${o.createdAt.toISOString()}`;
        }).join('\n');

        return header + rows;
    }
};
