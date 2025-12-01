import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  identifier: string;
  code: string;
  channel: "email" | "mobile";
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
    channel: { type: String, enum: ["email", "mobile"], required: true },
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

// 👇 THIS IS THE KEY FIX — NAMED EXPORT
export const OTP =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
