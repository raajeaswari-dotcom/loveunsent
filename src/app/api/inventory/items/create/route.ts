import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { InventoryItem } from '@/models/InventoryItem';
import { z } from 'zod';

const createItemSchema = z.object({
    sku: z.string(),
    name: z.string(),
    type: z.enum(['paper', 'perfume', 'addon', 'packaging', 'other']),
    stock: z.number().min(0).default(0),
    threshold: z.number().min(0).default(10),
    unit: z.string().default('units')
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = createItemSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const item = await InventoryItem.create(result.data);

        return successResponse({ item }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
