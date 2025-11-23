import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Collection } from '@/models/Collection';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const collectionSchema = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    price: z.number(),
    imageUrl: z.string().url(),
    category: z.enum(['stationery', 'gift', 'accessory', 'other']).optional(),
    stock: z.number()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = collectionSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const collection = await Collection.create(result.data);
        return successResponse({ collection }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
