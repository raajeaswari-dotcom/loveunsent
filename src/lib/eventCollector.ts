import { AnalyticsEvent } from '@/models/AnalyticsEvent';

export const EventCollector = {
    async logEvent(
        eventType: string,
        data: {
            orderId?: string;
            userId?: string;
            payload?: any;
            metadata?: any
        }
    ) {
        try {
            await AnalyticsEvent.create({
                eventType,
                orderId: data.orderId,
                userId: data.userId,
                payload: data.payload || {},
                metadata: data.metadata || {}
            });
        } catch (error) {
            // Fail silently to not block main flow, but log error
            console.error('Failed to log analytics event:', error);
        }
    }
};
