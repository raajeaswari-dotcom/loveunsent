import mongoose from 'mongoose';

const PaymentSettingsSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['stripe', 'razorpay'],
        required: true,
        default: 'razorpay'
    },
    publicKey: {
        type: String,
        required: true
    },
    secretKey: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isTestMode: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure only one settings document exists
PaymentSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            provider: 'razorpay',
            publicKey: 'rzp_test_placeholder',
            secretKey: 'secret_placeholder',
            isActive: true,
            isTestMode: true
        });
    }
    return settings;
};

export const PaymentSettings = mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', PaymentSettingsSchema);
