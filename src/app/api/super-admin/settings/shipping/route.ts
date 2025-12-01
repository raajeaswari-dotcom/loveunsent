import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { ShippingRate } from '@/models/ShippingRate';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const createRateSchema = z.object({
    name: z.string().min(1),
    region: z.string().min(1),
    minWeight: z.number().min(0),
    maxWeight: z.number().min(0),
    price: z.number().min(0),
    isActive: z.boolean().optional()
});

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const rates = await ShippingRate.find().sort({ region: 1, minWeight: 1 });
        return successResponse({ rates });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = createRateSchema.safeParse(body);

        if (!result.success) {
            return errorResponse('Validation Error', 400, result.error.format());
        }

        const rate = await ShippingRate.create(result.data);
        return successResponse({ rate }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
