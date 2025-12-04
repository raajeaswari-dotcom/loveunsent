import { NextRequest, NextResponse } from "next/server";

// Diagnostic endpoint to check OTP configuration (remove in production)
export async function GET(req: NextRequest) {
    const masterOtp = process.env.MASTER_OTP;

    return NextResponse.json({
        masterOtpSet: !!masterOtp,
        masterOtpLength: masterOtp ? masterOtp.length : 0,
        masterOtpTrimmedLength: masterOtp ? masterOtp.trim().length : 0,
        // Show first and last char only for debugging
        masterOtpPreview: masterOtp ? `${masterOtp.charAt(0)}...${masterOtp.charAt(masterOtp.length - 1)}` : null,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
}
