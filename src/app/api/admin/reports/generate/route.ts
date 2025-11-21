import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { ReportService } from '@/lib/reports';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const type = req.nextUrl.searchParams.get('type');

        let data;
        switch (type) {
            case 'revenue':
                data = await ReportService.getMonthlyRevenue();
                break;
            case 'writers':
                data = await ReportService.getWriterPerformance();
                break;
            case 'orders':
                data = await ReportService.getOrderStats();
                break;
            default:
                return errorResponse('Invalid report type', 400);
        }

        return successResponse({ data });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
