import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
    name: String,
    basePrice: Number,
    description: String,
    isActive: { type: Boolean, default: true }
});

export const Product = models.Product || model('Product', ProductSchema);
