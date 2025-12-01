import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { PaymentSettings } from '@/models/PaymentSettings';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const updateSettingsSchema = z.object({
    provider: z.enum(['stripe', 'razorpay']),
    publicKey: z.string().min(1),
    secretKey: z.string().min(1),
    isActive: z.boolean(),
    isTestMode: z.boolean()
});

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const settings = await (PaymentSettings as any).getSettings();
        return successResponse({ settings });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = updateSettingsSchema.safeParse(body);

        if (!result.success) {
            return errorResponse('Validation Error', 400, result.error.format());
        }

        let settings = await PaymentSettings.findOne();
        if (!settings) {
            settings = new PaymentSettings(result.data);
        } else {
            Object.assign(settings, result.data);
        }

        await settings.save();

        return successResponse({ settings });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
