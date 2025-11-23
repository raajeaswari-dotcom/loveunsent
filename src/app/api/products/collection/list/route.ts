import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Collection } from '@/models/Collection';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const collections = await Collection.find({ isActive: true });
        return successResponse({ collections });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
