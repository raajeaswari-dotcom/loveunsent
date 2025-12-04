import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OTP } from "@/models/OTP";

// Test endpoint to check OTP status - REMOVE IN PRODUCTION
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const phone = url.searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ error: "Phone required" }, { status: 400 });
        }

        // Normalize phone
        const cleanPhone = phone.replace(/[\s\r\n\t]/g, '').trim().toLowerCase();

        // Get latest OTP
        const latestOTP: any = await OTP.findOne({
            identifier: cleanPhone,
            type: "mobile"
        }).sort({ createdAt: -1 }).lean();

        // Check MASTER_OTP
        const rawMasterOtp = process.env.MASTER_OTP;
        const masterOtp = rawMasterOtp ? rawMasterOtp.replace(/[\s\r\n\t]/g, '').replace(/\D/g, '') : null;

        return NextResponse.json({
            phone: cleanPhone,
            masterOtpSet: !!rawMasterOtp,
            masterOtpValue: masterOtp, // Only for debugging - remove in production!
            masterOtpRawLength: rawMasterOtp?.length,
            masterOtpCleanedLength: masterOtp?.length,
            latestOTP: latestOTP ? {
                id: String(latestOTP._id),
                identifier: latestOTP.identifier,
                code: latestOTP.code,
                type: latestOTP.type,
                verified: latestOTP.verified,
                createdAt: latestOTP.createdAt,
                expiresAt: latestOTP.expiresAt,
            } : null,
            nodeEnv: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
