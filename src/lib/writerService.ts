import { Order } from '@/models/Order';
import { WriterProfile } from '@/models/WriterProfile';
import { WriterEarnings } from '@/models/WriterEarnings';
import { triggerNotification } from '@/lib/notificationService';
import mongoose from 'mongoose';

export const WriterService = {
    async fetchTasks(writerId: string, filter: 'assigned' | 'available' = 'assigned') {
        if (filter === 'assigned') {
            return await Order.find({
                'fulfillment.assignedWriter': writerId,
                status: { $in: ['assigned', 'writing_in_progress', 'changes_requested'] }
            }).sort({ createdAt: 1 });
        } else {
            // Available tasks (Queue system)
            // Find orders that are paid but not assigned
            return await Order.find({
                status: 'paid', // or 'pending_assignment'
                'fulfillment.assignedWriter': { $exists: false }
            }).limit(10);
        }
    },

    async acceptTask(orderId: string, writerId: string) {
        // Atomic operation to prevent double assignment
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                status: 'paid', // Only accept if currently in 'paid' (unassigned) state
                'fulfillment.assignedWriter': { $exists: false }
            },
            {
                $set: {
                    'fulfillment.assignedWriter': writerId,
                    status: 'assigned',
                    workflowState: 'assigned'
                }
            },
            { new: true }
        );

        if (!order) {
            throw new Error('Task not available or already assigned');
        }

        // Check writer workload limit (optional, could be done before update)
        // const activeTasks = await Order.countDocuments({ 'fulfillment.assignedWriter': writerId, status: 'assigned' });
        // if (activeTasks > 5) throw new Error('Workload limit reached');

        await triggerNotification('writer_assigned', order);
        return order;
    },

    async declineTask(orderId: string, writerId: string, reason: string) {
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                'fulfillment.assignedWriter': writerId,
                status: 'assigned'
            },
            {
                $unset: { 'fulfillment.assignedWriter': "" },
                $set: { status: 'paid', workflowState: 'paid' } // Return to pool
            },
            { new: true }
        );

        if (!order) throw new Error('Order not found or cannot be declined');

        // Log decline reason?
        console.log(`Writer ${writerId} declined order ${orderId}: ${reason}`);

        return order;
    },

    async uploadDraft(orderId: string, writerId: string, fileUrl: string) {
        const order = await Order.findOne({ _id: orderId, 'fulfillment.assignedWriter': writerId });
        if (!order) throw new Error('Order not found or not assigned to you');

        order.fulfillment.writerSubmissionUrl = fileUrl;
        order.status = 'draft_uploaded';
        order.workflowState = 'qc_review';
        await order.save();

        // Notify QC
        // triggerNotification('draft_uploaded', order);

        return order;
    },

    async calculateEarnings(orderId: string, writerId: string) {
        const order = await Order.findById(orderId);
        if (!order) return;

        const profile = await WriterProfile.findOne({ userId: writerId });
        const rate = profile?.ratePerPage || 50;

        // Calculate based on pages/words
        const pages = order.pages || 1;
        const amount = rate * pages;

        await WriterEarnings.create({
            writerId,
            orderId,
            amount,
            status: 'pending',
            breakdown: { basePay: amount, bonus: 0, penalty: 0 }
        });
    }
};
