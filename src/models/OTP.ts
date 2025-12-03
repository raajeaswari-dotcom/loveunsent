import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  identifier: string;
  code: string;
  type: "email" | "mobile";
  purpose: "signup" | "login" | "verification";
  verified: boolean;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

const OTPSchema = new Schema<IOTP>(
  {
    identifier: { type: String, required: true },
    code: { type: String, required: true },
    // changed from `channel` -> `type` to match DB documents
    type: { type: String, enum: ["email", "mobile"], required: true },
    purpose: {
      type: String,
      enum: ["signup", "login", "verification"],
      default: "login",
    },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Export model (keeps existing collection name)
export const OTP =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
