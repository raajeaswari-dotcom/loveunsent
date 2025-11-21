import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { WriterEarnings } from '@/models/WriterEarnings';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'writer') return errorResponse('Forbidden', 403);

        const earnings = await WriterEarnings.find({ writerId: decoded.userId }).sort({ createdAt: -1 });

        const totalEarned = earnings.reduce((acc, curr) => acc + curr.amount, 0);
        const pendingPayout = earnings
            .filter(e => e.status === 'pending' || e.status === 'approved')
            .reduce((acc, curr) => acc + curr.amount, 0);

        return successResponse({
            totalEarned,
            pendingPayout,
            history: earnings
        });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
