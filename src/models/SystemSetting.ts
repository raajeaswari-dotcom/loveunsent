import mongoose, { Schema, model, models } from 'mongoose';

const SystemSettingSchema = new Schema({
    addonsEnabled: {
        type: Boolean,
        default: true
    },
    paymentMethods: {
        cod: {
            type: Boolean,
            default: true
        },
        online: {
            type: Boolean,
            default: true
        }
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure only one settings document exists
SystemSettingSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            addonsEnabled: true,
            paymentMethods: {
                cod: true,
                online: true
            },
            maintenanceMode: false
        });
    }
    return settings;
};

export const SystemSetting = models.SystemSetting || model('SystemSetting', SystemSettingSchema);
