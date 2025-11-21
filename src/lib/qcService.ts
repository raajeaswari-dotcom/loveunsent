import { Order } from '@/models/Order';
import { QCRecord } from '@/models/QCRecord';
import { OrderWorkflow } from '@/lib/orderWorkflow';
import { triggerNotification } from '@/lib/notificationService';

export const QCService = {
    async runBasicChecks(orderId: string, imageUrl: string) {
        // Placeholder for automated checks (e.g., calling an external AI service or image analysis)
        // For now, we return a mock result
        return {
            resolutionOK: true, // Mock
            fileSizeOK: true,   // Mock
            detectedText: "Mock text detection",
            timestamp: new Date()
        };
    },

    async approveOrder(qcId: string, orderId: string, comments?: string) {
        // Use the central workflow engine for state transition
        const order = await OrderWorkflow.qcApprove(orderId, qcId);

        // Record the QC action
        await QCRecord.create({
            orderId,
            qcId,
            writerId: order.fulfillment.assignedWriter,
            result: 'approved',
            comments,
            submissionUrl: order.fulfillment.writerSubmissionUrl,
            checklist: {
                imageResolution: true, // In real app, these come from UI input
                wordCountMet: true,
                spellingCheck: true,
                handwritingMatch: true
            }
        });

        return order;
    },

    async rejectOrder(qcId: string, orderId: string, reason: string, checklist?: any) {
        // Use central workflow to transition to 'changes_requested'
        const order = await OrderWorkflow.qcReject(orderId, qcId, reason);

        await QCRecord.create({
            orderId,
            qcId,
            writerId: order.fulfillment.assignedWriter,
            result: 'changes_requested',
            comments: reason,
            submissionUrl: order.fulfillment.writerSubmissionUrl,
            checklist: checklist || {}
        });

        // Notify Writer
        await triggerNotification('qc_rejected', order); // Ensure this event is handled in notificationService

        return order;
    },

    async getPendingTasks(qcId: string) { // qcId optional if pool is shared
        return await Order.find({
            workflowState: 'qc_review'
        }).populate('fulfillment.assignedWriter', 'name').sort({ updatedAt: 1 });
    }
};
