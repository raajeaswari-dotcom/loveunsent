import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Paper } from '@/models/Paper';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const papers = await Paper.find({ isActive: true });
        return successResponse({ papers });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
