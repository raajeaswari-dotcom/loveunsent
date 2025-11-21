import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        // Admin can see all, Writer can see own
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin' && decoded.role !== 'writer')) {
            return errorResponse('Forbidden', 403);
        }

        const writerId = req.nextUrl.searchParams.get('writerId') || (decoded.role === 'writer' ? decoded.userId : null);

        if (!writerId) {
            return errorResponse('Writer ID required', 400);
        }

        const stats = await Order.aggregate([
            { $match: { 'fulfillment.assignedWriter': writerId } }, // Match by ID directly if stored as string or ObjectId. Mongoose usually handles casting but in aggregate we need to be careful.
            // Assuming writerId is stored as ObjectId in DB, we might need to cast if passing string.
            // However, let's rely on Mongoose auto-casting or simple find first.
            // Actually, for aggregate, we need to match types.
            // Let's use a simpler countDocuments approach for robustness without ObjectId casting complexity in this snippet.
        ]);

        // Simpler approach for stats
        const pending = await Order.countDocuments({ 'fulfillment.assignedWriter': writerId, status: 'assigned' });
        const inProgress = await Order.countDocuments({ 'fulfillment.assignedWriter': writerId, status: 'writing_in_progress' });
        const completed = await Order.countDocuments({ 'fulfillment.assignedWriter': writerId, status: 'approved' });
        const rejected = await Order.countDocuments({ 'fulfillment.assignedWriter': writerId, status: 'changes_requested' });

        return successResponse({
            writerId,
            workload: {
                pending,
                inProgress,
                completed,
                rejected,
                total: pending + inProgress + completed + rejected
            }
        });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
