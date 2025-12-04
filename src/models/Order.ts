import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required']
    },

    // Product Details
    paperId: { type: Schema.Types.ObjectId, ref: 'Paper', required: true },
    perfumeId: { type: Schema.Types.ObjectId, ref: 'Perfume' },
    handwritingStyleId: { type: Schema.Types.ObjectId, ref: 'Handwriting', required: true },
    addOns: [{ type: Schema.Types.ObjectId, ref: 'Addon' }],

    // Content
    inputMethod: {
        type: String,
        enum: ['text', 'voice', 'image'],
        default: 'text'
    },
    message: {
        type: String,
        required: function (this: any) { return this.inputMethod === 'text'; }
    },
    voiceNoteURL: { type: String },
    handwritingImageUrl: { type: String },
    pages: { type: Number, default: 1 },
    wordCount: { type: Number },

    // Financials
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    currency: { type: String, default: 'INR' },

    // Workflow & Assignments
    writerId: { type: Schema.Types.ObjectId, ref: 'User' },
    qcId: { type: Schema.Types.ObjectId, ref: 'User' },

    trackingId: { type: String },
    courierPartner: { type: String },
    requestedDeliveryDate: { type: Date },

    workflowState: {
        type: String,
        enum: [
            'pending_payment',
            'paid',
            'assigned',
            'writing_in_progress',
            'draft_uploaded',
            'qc_review',
            'changes_requested',
            'approved',
            'packed',
            'shipped',
            'delivered',
            'cancelled'
        ],
        default: 'pending_payment'
    },

    // Payment Details (Embedded)
    payment: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        status: { type: String, enum: ['pending', 'captured', 'failed'], default: 'pending' },
        method: { type: String, enum: ['cod', 'online'], default: 'online' },
        paidAt: Date
    },

    // Fulfillment Details (Embedded)
    fulfillment: {
        writerSubmissionUrl: String,
        qcFeedback: String,
        shippedAt: Date,
        deliveredAt: Date
    },

    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    }
}, {
    timestamps: true
});

// Indexes for faster queries
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ writerId: 1 });
OrderSchema.index({ workflowState: 1 });

export const Order = models.Order || model('Order', OrderSchema);
