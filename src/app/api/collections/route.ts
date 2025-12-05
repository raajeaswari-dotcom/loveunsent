import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Collection } from '@/models/Collection';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Fetch all active collections
        const collections = await Collection.find({ isActive: true }).sort({ createdAt: 1 });

        return successResponse({ collections });
    } catch (error: any) {
        console.error('Error fetching collections:', error);
        return errorResponse('Failed to fetch collections', 500);
    }
}
