import mongoose, { Schema, model, models } from 'mongoose';

const WriterProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: String,
    languages: [{ type: String }], // e.g., ['English', 'Hindi']
    specializations: [{ type: String }], // e.g., ['Calligraphy', 'Cursive']

    // Rates
    ratePerPage: { type: Number, default: 50 }, // Base rate per page
    currency: { type: String, default: 'INR' },

    // Availability & Schedule
    isAvailable: { type: Boolean, default: true },
    schedule: {
        monday: { start: String, end: String, active: Boolean },
        tuesday: { start: String, end: String, active: Boolean },
        wednesday: { start: String, end: String, active: Boolean },
        thursday: { start: String, end: String, active: Boolean },
        friday: { start: String, end: String, active: Boolean },
        saturday: { start: String, end: String, active: Boolean },
        sunday: { start: String, end: String, active: Boolean },
    },

    // Performance
    rating: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },

    // Samples (referencing Handwriting model or direct URLs)
    samples: [{
        styleId: { type: Schema.Types.ObjectId, ref: 'Handwriting' },
        imageUrl: String
    }]
}, {
    timestamps: true
});

export const WriterProfile = models.WriterProfile || model('WriterProfile', WriterProfileSchema);
