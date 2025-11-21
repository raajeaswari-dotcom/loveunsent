import mongoose, { Schema, model, models } from 'mongoose';

const AdminActionLogSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'ASSIGN_WRITER', 'ISSUE_REFUND'
    targetId: { type: String }, // ID of the object being modified (Order ID, User ID, etc.)
    targetModel: { type: String }, // 'Order', 'User', 'Product'
    payload: { type: Object }, // Details of the change
    ipAddress: { type: String },
    userAgent: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export const AdminActionLog = models.AdminActionLog || model('AdminActionLog', AdminActionLogSchema);
