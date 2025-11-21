import mongoose, { Schema, model, models } from 'mongoose';

const HandwritingSchema = new Schema({
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true }, // Preview image
    priceExtra: { type: Number, default: 0, min: 0 },
    isCursive: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Handwriting = models.Handwriting || model('Handwriting', HandwritingSchema);
