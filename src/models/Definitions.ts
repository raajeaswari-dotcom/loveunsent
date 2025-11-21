import mongoose, { Schema, model, models } from 'mongoose';

// --- Paper Model ---
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

// --- Perfume Model ---
const PerfumeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: String,
    priceExtra: { type: Number, default: 0, min: 0 },
    imageUrl: String,
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const Perfume = models.Perfume || model('Perfume', PerfumeSchema);

// --- Addon Model ---
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

// --- Handwriting Model ---
const HandwritingSchema = new Schema({
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true }, // Preview image
    priceExtra: { type: Number, default: 0, min: 0 },
    isCursive: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const Handwriting = models.Handwriting || model('Handwriting', HandwritingSchema);

// --- Occasion Model ---
const OccasionSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String }, // Emoji or icon representation
    description: { type: String },
    imageUrl: { type: String }, // Category image for display
    displayOrder: { type: Number, default: 0 }, // For ordering on homepage
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const Occasion = models.Occasion || model('Occasion', OccasionSchema);
