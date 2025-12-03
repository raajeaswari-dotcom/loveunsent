import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // This endpoint helps debug email configuration
    // Remove this in production!

    return NextResponse.json({
        environment: process.env.NODE_ENV,
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
        resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5) || 'NOT_SET',
        emailFrom: process.env.EMAIL_FROM || 'NOT_SET',
        hasMasterOTP: !!process.env.MASTER_OTP,
        masterOTP: process.env.MASTER_OTP || 'NOT_SET',
    });
}
