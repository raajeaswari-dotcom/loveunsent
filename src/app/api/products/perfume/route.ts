import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Perfume } from '@/models/Perfume';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const perfumeSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    priceExtra: z.number(),
    imageUrl: z.string().optional(),
    stock: z.number().optional()
});

// CREATE
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = perfumeSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const perfume = await Perfume.create(result.data);
        return successResponse({ perfume }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

// LIST
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const perfumes = await Perfume.find({ isActive: true });
        return successResponse({ perfumes });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

// UPDATE & DELETE (Simulated via query param ?id=... and method)
// In App Router, we usually use dynamic routes [id]/route.ts.
// For simplicity in this single file structure request, I'll handle PUT/DELETE here with ID in body or query.
// Ideally, this should be in /api/products/perfume/[id]/route.ts
