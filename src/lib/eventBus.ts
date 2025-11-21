import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    // Typed emit wrapper
    public publish(event: string, payload: any) {
        console.log(`[EventBus] Publishing: ${event}`, payload?.orderId || payload?.id || '');
        this.emit(event, payload);
    }

    // Typed subscribe wrapper
    public subscribe(event: string, handler: (payload: any) => void) {
        this.on(event, async (payload) => {
            try {
                await handler(payload);
            } catch (error) {
                console.error(`[EventBus] Error handling ${event}:`, error);
                // Here we could push to a Dead Letter Queue (DLQ) in a real system
            }
        });
    }
}

export const eventBus = EventBus.getInstance();

// Event Constants
export const EVENTS = {
    ORDER_CREATED: 'ORDER_CREATED',
    PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
    WRITER_ASSIGNED: 'WRITER_ASSIGNED',
    WRITER_ACCEPTED: 'WRITER_ACCEPTED', // If explicit acceptance step exists
    DRAFT_UPLOADED: 'DRAFT_UPLOADED',
    QC_APPROVED: 'QC_APPROVED',
    QC_REJECTED: 'QC_REJECTED',
    ORDER_SHIPPED: 'ORDER_SHIPPED',
    ORDER_DELIVERED: 'ORDER_DELIVERED',
    LOW_STOCK: 'LOW_STOCK'
};
