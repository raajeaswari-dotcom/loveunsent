import mongoose, { Schema, model, models } from 'mongoose';

const PaperSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    priceExtra: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, required: true },
    gsm: { type: Number }, // Grams per square meter
    texture: String,
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Paper = models.Paper || model('Paper', PaperSchema);
