import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { WriterProfile } from '@/models/WriterProfile';
import { z } from 'zod';

const availabilitySchema = z.object({
    isAvailable: z.boolean(),
    schedule: z.object({
        monday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
        // ... other days optional for now
    }).optional()
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'writer') return errorResponse('Forbidden', 403);

        const body = await req.json();
        const result = availabilitySchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const profile = await WriterProfile.findOneAndUpdate(
            { userId: decoded.userId },
            { $set: result.data },
            { new: true, upsert: true } // Create if doesn't exist
        );

        return successResponse({ profile });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
