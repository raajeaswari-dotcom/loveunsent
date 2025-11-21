import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Perfume } from '@/models/Definitions';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// GET single perfume
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const perfume = await Perfume.findById(params.id);
        if (!perfume) return errorResponse('Perfume not found', 404);
        return successResponse({ perfume });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

// UPDATE
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
            return errorResponse('Forbidden', 403);
        }

        const id = params.id;
        const body = await req.json();

        const perfume = await Perfume.findByIdAndUpdate(id, body, { new: true });
        if (!perfume) return errorResponse('Perfume not found', 404);

        return successResponse({ perfume });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

// DELETE (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
            return errorResponse('Forbidden', 403);
        }

        const id = params.id;
        const perfume = await Perfume.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!perfume) return errorResponse('Perfume not found', 404);

        return successResponse({ message: 'Perfume deleted successfully' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
