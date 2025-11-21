import { Order } from '@/models/Order';
import { triggerNotification } from '@/lib/notificationService';

// Mapping User's requested abstract states to DB Schema values
// pending -> paid (assuming we start workflow after payment)
// writer_assigned -> assigned
// writing_in_progress -> writing_in_progress
// waiting_qc -> draft_uploaded / qc_review
// qc_rejected -> changes_requested
// ready_for_packaging -> approved
// shipped -> shipped
// delivered -> delivered

export const OrderWorkflow = {
    async assignWriter(orderId: string, writerId: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        // Validation: Can only assign if paid or already assigned (re-assign)
        if (!['paid', 'assigned', 'changes_requested'].includes(order.workflowState)) {
            throw new Error(`Cannot assign writer. Current state: ${order.workflowState}`);
        }

        order.fulfillment.assignedWriter = writerId;
        order.status = 'assigned';
        order.workflowState = 'assigned';
        await order.save();

        await triggerNotification('writer_assigned', order);
        return order;
    },

    async writerUploadDraft(orderId: string, fileUrl: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        if (!['assigned', 'writing_in_progress', 'changes_requested'].includes(order.workflowState)) {
            throw new Error(`Cannot upload draft. Current state: ${order.workflowState}`);
        }

        order.fulfillment.writerSubmissionUrl = fileUrl;
        order.status = 'draft_uploaded'; // or qc_review
        order.workflowState = 'qc_review'; // Moving to QC
        await order.save();

        // Notify QC? (Not explicitly requested in notification list, but good practice)
        return order;
    },

    async qcApprove(orderId: string, qcId: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        if (order.workflowState !== 'qc_review') {
            throw new Error(`Cannot approve. Order is not in QC review. Current state: ${order.workflowState}`);
        }

        order.fulfillment.assignedQC = qcId;
        order.status = 'approved';
        order.workflowState = 'approved'; // Ready for packaging
        await order.save();

        await triggerNotification('qc_completed', order);
        return order;
    },

    async qcReject(orderId: string, qcId: string, feedback: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        if (order.workflowState !== 'qc_review') {
            throw new Error(`Cannot reject. Order is not in QC review. Current state: ${order.workflowState}`);
        }

        order.fulfillment.assignedQC = qcId;
        order.fulfillment.qcFeedback = feedback;
        order.status = 'changes_requested';
        order.workflowState = 'changes_requested';
        await order.save();

        // Notify Writer?
        return order;
    },

    async markShipped(orderId: string, trackingId: string, courierPartner?: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        if (order.workflowState !== 'approved' && order.workflowState !== 'packed') {
            throw new Error(`Cannot ship. Order is not approved/packed. Current state: ${order.workflowState}`);
        }

        order.trackingId = trackingId;
        if (courierPartner) order.courierPartner = courierPartner;
        order.fulfillment.shippedAt = new Date();
        order.status = 'shipped';
        order.workflowState = 'shipped';
        await order.save();

        await triggerNotification('shipped', order);
        return order;
    },

    async markDelivered(orderId: string) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        if (order.workflowState !== 'shipped') {
            throw new Error(`Cannot mark delivered. Order is not shipped. Current state: ${order.workflowState}`);
        }

        order.fulfillment.deliveredAt = new Date();
        order.status = 'delivered';
        order.workflowState = 'delivered';
        await order.save();

        await triggerNotification('delivered', order);
        return order;
    }
};
