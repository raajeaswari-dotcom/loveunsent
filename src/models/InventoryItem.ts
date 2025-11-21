import mongoose, { Schema, model, models } from 'mongoose';

const InventoryItemSchema = new Schema({
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    description: String,

    type: {
        type: String,
        enum: ['paper', 'perfume', 'addon', 'packaging', 'other'],
        required: true
    },

    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 }, // Stock committed to active orders but not yet shipped

    threshold: { type: Number, default: 10 }, // Low stock alert level
    unit: { type: String, default: 'units' }, // e.g., 'sheets', 'ml', 'boxes'

    supplier: {
        name: String,
        contactEmail: String,
        leadTimeDays: Number
    },

    costPrice: { type: Number },
    location: { type: String } // Warehouse location
}, {
    timestamps: true
});

// Virtual for available stock
InventoryItemSchema.virtual('available').get(function () {
    return this.stock - this.reserved;
});

export const InventoryItem = models.InventoryItem || model('InventoryItem', InventoryItemSchema);
