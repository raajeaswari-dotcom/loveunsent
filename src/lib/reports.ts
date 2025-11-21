import { Order } from '@/models/Order';
import { User } from '@/models/User';

export const ReportService = {
    async getMonthlyRevenue() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $nin: ['cancelled', 'pending_payment'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return result[0] || { totalRevenue: 0, count: 0 };
    },

    async getWriterPerformance() {
        return await Order.aggregate([
            { $match: { 'fulfillment.assignedWriter': { $exists: true } } },
            {
                $group: {
                    _id: '$fulfillment.assignedWriter',
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    avgRating: { $avg: '$rating' } // Assuming rating exists, else 0
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
                    completedOrders: 1,
                    avgRating: 1
                }
            }
        ]);
    },

    async getOrderStats() {
        return await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
    }
};
