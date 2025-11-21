import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { POService } from '@/lib/poService';
import { z } from 'zod';

const createPOSchema = z.object({
    poNumber: z.string(),
    supplier: z.object({ name: z.string(), email: z.string().optional() }),
    items: z.array(z.object({
        itemId: z.string(),
        sku: z.string(),
        quantity: z.number().positive(),
        unitCost: z.number().positive()
    })),
    totalCost: z.number().positive()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = createPOSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const po = await POService.createPO(result.data, decoded.userId);

        return successResponse({ po }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
