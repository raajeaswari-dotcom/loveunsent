import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Paper } from '@/models/Paper';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const paperSchema = z.object({
    name: z.string(),
    slug: z.string(),
    priceExtra: z.number(),
    imageUrl: z.string().url(),
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
        const result = paperSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const paper = await Paper.create(result.data);
        return successResponse({ paper }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
