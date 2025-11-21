import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { AdminActionLog } from '@/models/AdminActionLog';
import { triggerNotification } from '@/lib/notificationService';
import { OrderWorkflow } from '@/lib/orderWorkflow';

export const AdminService = {
    async logAction(adminId: string, action: string, targetModel: string, targetId: string, payload: any) {
        await AdminActionLog.create({
            adminId,
            action,
            targetModel,
            targetId,
            payload
        });
    },

    async reassignWriter(adminId: string, orderId: string, writerId: string, reason?: string) {
        const order = await OrderWorkflow.assignWriter(orderId, writerId);

        await this.logAction(adminId, 'REASSIGN_WRITER', 'Order', orderId, { writerId, reason });

        // Notify new writer (handled in workflow)
        // Notify old writer? (TODO)

        return order;
    },

    async issueRefund(adminId: string, orderId: string, amount: number | undefined, reason: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        const refundAmount = amount || order.price;

        // Logic to trigger Razorpay refund would go here
        // await razorpay.payments.refund(order.payment.razorpayPaymentId, { amount: refundAmount * 100 });

        order.payment.status = 'refunded'; // or partial_refunded
        order.status = 'cancelled'; // Full refund usually implies cancellation
        order.workflowState = 'cancelled';
        await order.save();

        await this.logAction(adminId, 'ISSUE_REFUND', 'Order', orderId, { amount: refundAmount, reason });

        // Notify customer
        // triggerNotification('refund_issued', order);

        return order;
    },

    async approveWriter(adminId: string, writerId: string) {
        const writer = await User.findByIdAndUpdate(writerId, {
            'writerProfile.isVerified': true,
            role: 'writer' // Ensure role is set if it was pending
        }, { new: true });

        if (!writer) throw new Error('Writer not found');

        await this.logAction(adminId, 'APPROVE_WRITER', 'User', writerId, {});
        return writer;
    },

    async rejectWriter(adminId: string, writerId: string, reason: string) {
        const writer = await User.findByIdAndUpdate(writerId, {
            'writerProfile.isVerified': false,
            // Maybe set to customer or keep as writer but inactive?
            isActive: false
        }, { new: true });

        if (!writer) throw new Error('Writer not found');

        await this.logAction(adminId, 'REJECT_WRITER', 'User', writerId, { reason });
        return writer;
    }
};
