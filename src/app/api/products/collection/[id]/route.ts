import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Collection } from '@/models/Collection';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// UPDATE
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const id = params.id;
        const body = await req.json();

        const collection = await Collection.findByIdAndUpdate(id, body, { new: true });
        if (!collection) return errorResponse('Collection item not found', 404);

        return successResponse({ collection });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) return errorResponse('Forbidden', 403);

        const id = params.id;
        const collection = await Collection.findByIdAndUpdate(id, { isActive: false }, { new: true }); // Soft delete
        if (!collection) return errorResponse('Collection item not found', 404);

        return successResponse({ message: 'Collection item deleted successfully' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
