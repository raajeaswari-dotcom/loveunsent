import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { SystemSetting } from '@/models/SystemSetting';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const settings = await (SystemSetting as any).getSettings();
        return successResponse({ settings });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        // Verify Admin
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || !['admin', 'super_admin'].includes(decoded.role)) {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();

        // Use findOneAndUpdate to ensure we update the single document
        const settings = await SystemSetting.findOneAndUpdate(
            {},
            { $set: body },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return successResponse({ settings });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
