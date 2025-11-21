import mongoose, { Schema, model, models } from 'mongoose';

const TaxConfigSchema = new Schema({
    taxType: {
        type: String,
        enum: ['GST', 'IGST', 'CGST', 'SGST', 'CUSTOM'],
        required: true
    },
    taxName: {
        type: String,
        required: true,
        trim: true
    },
    taxRate: {
        type: Number, // Percentage
        required: true,
        min: 0,
        max: 100
    },
    applicableStates: [{
        type: String,
        trim: true
    }], // Empty array = applies to all states
    hsnCode: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    effectiveFrom: {
        type: Date,
        required: true
    },
    effectiveTo: {
        type: Date // null = no end date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
TaxConfigSchema.index({ isActive: 1 });
TaxConfigSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
TaxConfigSchema.index({ applicableStates: 1 });

export const TaxConfig = models.TaxConfig || model('TaxConfig', TaxConfigSchema);
