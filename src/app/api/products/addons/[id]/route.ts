import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Addon } from '@/models/Definitions';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// GET single addon
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const addon = await Addon.findById(params.id);
        if (!addon) return errorResponse('Add-on not found', 404);
        return successResponse({ addon });
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

        const addon = await Addon.findByIdAndUpdate(id, body, { new: true });
        if (!addon) return errorResponse('Add-on not found', 404);

        return successResponse({ addon });
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
        const addon = await Addon.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!addon) return errorResponse('Add-on not found', 404);

        return successResponse({ message: 'Add-on deleted successfully' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
