import mongoose, { Schema, model, models } from 'mongoose';

const AnalyticsEventSchema = new Schema({
    eventType: {
        type: String,
        required: true,
        enum: [
            'order_created',
            'payment_success',
            'writer_assigned',
            'draft_uploaded',
            'qc_approved',
            'qc_rejected',
            'shipped',
            'delivered',
            'order_cancelled',
            'refund_issued'
        ]
    },

    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Actor (Customer, Admin, Writer)

    payload: { type: Object }, // Flexible payload for event details (amount, reason, etc.)

    metadata: {
        ipAddress: String,
        userAgent: String,
        source: String
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for efficient querying and aggregation
AnalyticsEventSchema.index({ eventType: 1, createdAt: 1 });
AnalyticsEventSchema.index({ orderId: 1 });
AnalyticsEventSchema.index({ userId: 1 });

export const AnalyticsEvent = models.AnalyticsEvent || model('AnalyticsEvent', AnalyticsEventSchema);
