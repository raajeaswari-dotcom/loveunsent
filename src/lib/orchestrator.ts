import { eventBus, EVENTS } from '@/lib/eventBus';
import { InventoryService } from '@/lib/inventoryService';
import { AnalyticsService } from '@/lib/analyticsService';
import { EventCollector } from '@/lib/eventCollector';
import { triggerNotification } from '@/lib/notificationService';
import { POService } from '@/lib/poService';

export const Orchestrator = {
    init() {
        // 1. Order Created
        eventBus.subscribe(EVENTS.ORDER_CREATED, async (order) => {
            // Reserve Stock (Optimistic)
            // Assuming order.items contains mapped inventory IDs
            // await InventoryService.reserveStockForOrder(order.items);

            // Log Analytics
            await EventCollector.logEvent('order_created', {
                orderId: order._id,
                userId: order.customerId,
                payload: { amount: order.price }
            });
        });

        // 2. Payment Confirmed
        eventBus.subscribe(EVENTS.PAYMENT_CONFIRMED, async (order) => {
            // Finalize Stock Reservation (Commit)
            // await InventoryService.commitStock(order.items);

            // Log Analytics
            await EventCollector.logEvent('payment_success', {
                orderId: order._id,
                userId: order.customerId,
                payload: { amount: order.price }
            });

            // Notify Admin (New Order)
            // triggerNotification('admin_new_order', order);
        });

        // 3. Writer Assigned
        eventBus.subscribe(EVENTS.WRITER_ASSIGNED, async (order) => {
            await EventCollector.logEvent('writer_assigned', {
                orderId: order._id,
                userId: order.fulfillment.assignedWriter
            });
        });

        // 4. Draft Uploaded
        eventBus.subscribe(EVENTS.DRAFT_UPLOADED, async (order) => {
            await EventCollector.logEvent('draft_uploaded', {
                orderId: order._id,
                userId: order.fulfillment.assignedWriter
            });

            // Notify QC (handled in service, but could be here)
            // triggerNotification('qc_pending', order);
        });

        // 5. QC Approved
        eventBus.subscribe(EVENTS.QC_APPROVED, async (order) => {
            await EventCollector.logEvent('qc_approved', {
                orderId: order._id,
                userId: order.fulfillment.assignedQC
            });

            // Decrement Stock (Physical items used)
            // await InventoryService.adjustStock(order.paperId, 1, 'Order Fulfilled', 'remove');

            // Schedule Packaging / Generate Label
            console.log(`[Orchestrator] Scheduling packaging for Order ${order._id}`);
        });

        // 6. QC Rejected
        eventBus.subscribe(EVENTS.QC_REJECTED, async (order) => {
            await EventCollector.logEvent('qc_rejected', {
                orderId: order._id,
                userId: order.fulfillment.assignedQC,
                payload: { reason: order.fulfillment.qcFeedback }
            });
        });

        // 7. Order Shipped
        eventBus.subscribe(EVENTS.ORDER_SHIPPED, async (order) => {
            await EventCollector.logEvent('shipped', {
                orderId: order._id
            });

            // Notify Customer (handled in service)
        });

        // 8. Low Stock Alert
        eventBus.subscribe(EVENTS.LOW_STOCK, async (item) => {
            // Auto-create PO draft?
            // await POService.createDraftPO(item);
            console.log(`[Orchestrator] Low stock alert received for ${item.sku}`);
        });

        console.log('[Orchestrator] Initialized and listening to events.');
    }
};
