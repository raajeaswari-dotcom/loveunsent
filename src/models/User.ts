import mongoose, { Schema, model, models } from "mongoose";

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

    addresses: [
      {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: Boolean,
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
