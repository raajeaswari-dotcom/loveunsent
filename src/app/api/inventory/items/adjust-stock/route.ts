import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { InventoryService } from '@/lib/inventoryService';
import { z } from 'zod';

const adjustStockSchema = z.object({
    itemId: z.string(),
    quantity: z.number().positive(),
    type: z.enum(['add', 'remove', 'reserve', 'release']),
    reason: z.string()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = adjustStockSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { itemId, quantity, type, reason } = result.data;
        const item = await InventoryService.adjustStock(itemId, quantity, reason, type);

        return successResponse({ item });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
