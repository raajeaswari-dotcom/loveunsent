import mongoose, { Schema, model, models } from 'mongoose';

const CollectionSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    category: { type: String, enum: ['stationery', 'gift', 'accessory', 'other'], default: 'other' },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Collection = models.Collection || model('Collection', CollectionSchema);
