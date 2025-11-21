import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { WriterService } from '@/lib/writerService';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'writer') return errorResponse('Forbidden', 403);

        const filter = req.nextUrl.searchParams.get('filter') as 'assigned' | 'available' || 'assigned';

        const tasks = await WriterService.fetchTasks(decoded.userId, filter);

        return successResponse({ tasks });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
