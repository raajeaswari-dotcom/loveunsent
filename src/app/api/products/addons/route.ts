import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Addon } from '@/models/Addon';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const addonSchema = z.object({
    name: z.string(),
    type: z.enum(['photo', 'gift', 'packaging']),
    description: z.string().optional(),
    price: z.number(),
    imageUrl: z.string(),
    stock: z.number().optional()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = addonSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const addon = await Addon.create(result.data);
        return successResponse({ addon }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const addons = await Addon.find({ isActive: true });
        return successResponse({ addons });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
