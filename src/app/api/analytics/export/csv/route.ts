import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { errorResponse } from '@/utils/apiResponse';
import { AnalyticsService } from '@/lib/analyticsService';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const startDateStr = req.nextUrl.searchParams.get('startDate');
        const endDateStr = req.nextUrl.searchParams.get('endDate');

        const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = endDateStr ? new Date(endDateStr) : new Date();

        const csvData = await AnalyticsService.exportOrdersToCSV(startDate, endDate);

        return new NextResponse(csvData, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="orders_export_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv"`
            }
        });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
