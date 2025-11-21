import mongoose, { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: {
        type: String,
        enum: ['email', 'whatsapp', 'sms', 'in_app'],
        required: true
    },
    type: {
        type: String,
        enum: ['order_update', 'action_required', 'promo', 'system'],
        required: true
    },
    title: String,
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'read'],
        default: 'pending'
    },
    metadata: Object, // Stores orderId, etc.

    // Logs for external providers
    logs: [{
        provider: String, // e.g., 'SendGrid', 'Twilio'
        providerId: String,
        status: String,
        timestamp: { type: Date, default: Date.now },
        error: String
    }]
}, {
    timestamps: true
});

export const Notification = models.Notification || model('Notification', NotificationSchema);
