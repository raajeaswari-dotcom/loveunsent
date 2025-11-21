import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required']
    },
    role: {
        type: String,
        enum: {
            values: ['super_admin', 'admin', 'writer', 'qc', 'customer'],
            message: '{VALUE} is not a supported role'
        },
        default: 'customer'
    },
    permissions: [{
        type: String
    }], // Array of permission strings e.g., 'manage_users', 'approve_orders'

    // Writer specific fields
    handwritingSamples: [{
        styleId: { type: Schema.Types.ObjectId, ref: 'Handwriting' },
        imageUrl: String,
        approved: { type: Boolean, default: false }
    }],
    languages: [{
        type: String,
        enum: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi']
    }],

    phone: {
        type: String,
        trim: true
    },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: Boolean
    }],

    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const User = models.User || model('User', UserSchema);
