import mongoose, { Schema, model, models } from 'mongoose';

const RoleSchema = new Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        enum: ['super_admin', 'admin', 'writer', 'qc', 'customer']
    },
    permissions: [{
        type: String,
        required: true
    }],
    description: String,
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const Role = models.Role || model('Role', RoleSchema);
