import mongoose, { Schema, model, models } from 'mongoose';

const CouponSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // For percentage based
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
    usageLimit: { type: Number }, // Total times it can be used
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export const Coupon = models.Coupon || model('Coupon', CouponSchema);
