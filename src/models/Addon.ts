import mongoose, { Schema, model, models } from 'mongoose';

const AddonSchema = new Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['photo', 'gift', 'packaging'], required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Addon = models.Addon || model('Addon', AddonSchema);
