import mongoose, { Schema, model, models } from 'mongoose';

const WriterEarningsSchema = new Schema({
    writerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },

    amount: { type: Number, required: true }, // Amount earned for this order
    currency: { type: String, default: 'INR' },

    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'cancelled'],
        default: 'pending'
    },

    payoutId: { type: String }, // Reference to payout transaction
    payoutDate: { type: Date },

    breakdown: {
        basePay: Number,
        bonus: Number,
        penalty: Number
    }
}, {
    timestamps: true
});

// Index for quick aggregation
WriterEarningsSchema.index({ writerId: 1, status: 1 });

export const WriterEarnings = models.WriterEarnings || model('WriterEarnings', WriterEarningsSchema);
