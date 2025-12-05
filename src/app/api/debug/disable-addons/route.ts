import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { SystemSetting } from '@/models/SystemSetting';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        await (SystemSetting as any).getSettings(); // Ensures it exists

        await SystemSetting.findOneAndUpdate({}, { addonsEnabled: false });

        return successResponse({ message: 'Addons disabled successfully via script' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
