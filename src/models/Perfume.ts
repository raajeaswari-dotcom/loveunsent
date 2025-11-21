import mongoose, { Schema, model, models } from 'mongoose';

const PerfumeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: String,
    priceExtra: { type: Number, default: 0, min: 0 },
    imageUrl: String,
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Perfume = models.Perfume || model('Perfume', PerfumeSchema);
