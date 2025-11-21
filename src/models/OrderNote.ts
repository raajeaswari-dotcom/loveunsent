import mongoose, { Schema, model, models } from 'mongoose';

const OrderNoteSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: String,
        required: true,
        trim: true
    },
    noteType: {
        type: String,
        enum: ['info', 'warning', 'important'],
        default: 'info'
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
OrderNoteSchema.index({ orderId: 1, createdAt: -1 });

export const OrderNote = models.OrderNote || model('OrderNote', OrderNoteSchema);
