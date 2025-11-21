import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import { AnalyticsEvent } from '@/models/AnalyticsEvent'; // Using as idempotency log for now, or create separate
import crypto from 'crypto';

// Idempotency Store (Simple implementation using MongoDB)
// In production, use Redis with TTL
async function isProcessed(eventId: string): Promise<boolean> {
    const exists = await AnalyticsEvent.findOne({ 'metadata.webhookEventId': eventId });
    return !!exists;
}

async function markProcessed(eventId: string, source: string, payload: any) {
    await AnalyticsEvent.create({
        eventType: 'webhook_processed',
        metadata: { webhookEventId: eventId, source },
        payload
    });
}

export async function handleWebhook(req: NextRequest, secret: string, source: string, processor: (payload: any) => Promise<void>) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-signature') || req.headers.get('x-razorpay-signature');

        if (!signature) return errorResponse('Missing Signature', 400);

        // Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return errorResponse('Invalid Signature', 401);
        }

        const payload = JSON.parse(body);
        const eventId = payload.id || payload.event_id; // Depends on provider

        await connectDB();

        // Idempotency Check
        if (eventId && await isProcessed(eventId)) {
            return successResponse({ message: 'Already Processed' });
        }

        // Process Webhook
        await processor(payload);

        // Mark Processed
        if (eventId) {
            await markProcessed(eventId, source, payload);
        }

        return successResponse({ received: true });
    } catch (error: any) {
        console.error(`Webhook Error (${source}):`, error);
        return errorResponse(error.message, 500);
    }
}
