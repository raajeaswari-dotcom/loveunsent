import mongoose, { Schema, model, models } from "mongoose";

// Address subdocument schema
const AddressSchema = new Schema({
  recipientName: {
    type: String,
    required: [true, "Recipient name is required"],
    trim: true,
  },
  recipientPhone: {
    type: String,
    required: [true, "Recipient phone is required"],
    trim: true,
  },
  addressLine1: {
    type: String,
    required: [true, "Address line 1 is required"],
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, "PIN code is required"],
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^\d{6}$/.test(v);
      },
      message: "PIN code must be exactly 6 digits",
    },
  },
  country: {
    type: String,
    default: "India",
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: true }); // Enable _id for subdocuments

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: false, // NOT required for OTP login
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: false, // FIXED — allow mobile-only login
      unique: true,
      sparse: true, // FIX — prevents duplicate null errors
      lowercase: true,
      trim: true,
      // Allow empty unless actual email provided
      validate: {
        validator: function (v: any) {
          if (!v) return true; // allow null/undefined
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: "Please use a valid email address",
      },
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    passwordHash: {
      type: String,
      required: false, // optional for OTP users
    },

    role: {
      type: String,
      enum: ["super_admin", "admin", "writer", "qc", "customer"],
      default: "customer",
    },

    permissions: [
      {
        type: String,
      },
    ],

    // Writer-specific
    handwritingSamples: [
      {
        styleId: { type: Schema.Types.ObjectId, ref: "Handwriting" },
        imageUrl: String,
        approved: { type: Boolean, default: false },
      },
    ],

    languages: [
      {
        type: String,
        enum: [
          "English",
          "Hindi",
          "Marathi",
          "Tamil",
          "Telugu",
          "Kannada",
          "Malayalam",
          "Bengali",
          "Gujarati",
          "Punjabi",
        ],
      },
    ],

    phone: {
      type: String,
      unique: true,
      sparse: true, // FIX — allow multiple null values
      trim: true,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // Optional Personal Information
    dateOfBirth: {
      type: Date,
      required: false,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
      required: false,
    },

    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'gu', 'pa', ''],
      default: 'en',
      required: false,
    },

    alternatePhone: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function (v: any) {
          if (!v) return true; // allow empty
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Alternate phone must be a valid 10-digit Indian mobile number",
      },
    },

    addresses: [AddressSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
