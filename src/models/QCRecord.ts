import mongoose, { Schema, model, models } from 'mongoose';

const QCRecordSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    qcId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    writerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // The writer being reviewed

    result: {
        type: String,
        enum: ['approved', 'rejected', 'changes_requested'],
        required: true
    },

    comments: { type: String },

    checklist: {
        imageResolution: Boolean,
        wordCountMet: Boolean,
        spellingCheck: Boolean,
        handwritingMatch: Boolean,
        perfumeApplied: Boolean,
        packagingCorrect: Boolean
    },

    submissionUrl: { type: String }, // The draft URL being reviewed

    metadata: { type: Object } // Any extra automated check data
}, {
    timestamps: true
});

export const QCRecord = models.QCRecord || model('QCRecord', QCRecordSchema);
