import mongoose, { Schema, model, models } from 'mongoose';

const PurchaseOrderSchema = new Schema({
    poNumber: { type: String, required: true, unique: true },
    supplier: {
        name: String,
        email: String
    },

    items: [{
        itemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
        sku: String,
        quantity: Number,
        unitCost: Number
    }],

    totalCost: Number,

    status: {
        type: String,
        enum: ['created', 'ordered', 'received', 'closed', 'cancelled'],
        default: 'created'
    },

    expectedDate: Date,
    receivedDate: Date,

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String
}, {
    timestamps: true
});

export const PurchaseOrder = models.PurchaseOrder || model('PurchaseOrder', PurchaseOrderSchema);
