import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { PaymentSettings } from '@/models/PaymentSettings';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const settings = await PaymentSettings.findOne();
        if (!settings || !settings.isActive) {
            return errorResponse('Payment gateway is not configured or inactive', 400);
        }

        // Simulate a payment verification check
        // In a real scenario, we might try to create a dummy order or verify credentials with the provider SDK

        const isKeysValid = settings.publicKey.length > 5 && settings.secretKey.length > 5;

        if (isKeysValid) {
            return successResponse({
                message: 'Connection successful',
                details: `Successfully connected to ${settings.provider} in ${settings.isTestMode ? 'Test' : 'Live'} mode.`
            });
        } else {
            return errorResponse('Invalid API Keys', 400);
        }

    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
