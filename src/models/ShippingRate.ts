import mongoose, { Schema, model, models } from 'mongoose';

const ShippingRateSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    carrier: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    baseRate: {
        type: Number,
        required: true,
        min: 0
    },
    perKmRate: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveryDays: {
        type: Number,
        required: true,
        min: 1
    },
    maxWeight: {
        type: Number, // in grams
        default: 500
    },
    zones: [{
        type: String,
        trim: true
    }], // Applicable states or zone codes
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
ShippingRateSchema.index({ isActive: 1 });
ShippingRateSchema.index({ zones: 1 });

export const ShippingRate = models.ShippingRate || model('ShippingRate', ShippingRateSchema);
