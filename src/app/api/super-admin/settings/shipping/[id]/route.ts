import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { ShippingRate } from '@/models/ShippingRate';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const { id } = await context.params;
        const rate = await ShippingRate.findByIdAndDelete(id);

        if (!rate) {
            return errorResponse('Shipping rate not found', 404);
        }

        return successResponse({ message: 'Shipping rate deleted successfully' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
