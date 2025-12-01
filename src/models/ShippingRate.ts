import mongoose from 'mongoose';

const ShippingRateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true,
        default: 'India'
    },
    minWeight: {
        type: Number,
        required: true,
        default: 0
    },
    maxWeight: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const ShippingRate = mongoose.models.ShippingRate || mongoose.model('ShippingRate', ShippingRateSchema);
