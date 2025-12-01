import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['super_admin', 'admin', 'writer', 'qc', 'customer']).optional(),
    isActive: z.boolean().optional()
});

export async function PUT(
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
        const body = await req.json();
        const result = updateUserSchema.safeParse(body);

        if (!result.success) {
            return errorResponse('Validation Error', 400, result.error.format());
        }

        // Prevent user from changing their own role/status if they're super_admin
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return errorResponse('User not found', 404);
        }

        if (id === decoded.userId) {
            if (result.data.role && result.data.role !== userToUpdate.role) {
                return errorResponse('Cannot change your own role', 400);
            }
            if (result.data.isActive === false) {
                return errorResponse('Cannot deactivate yourself', 400);
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            id,
            { $set: result.data },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return errorResponse('User not found', 404);
        }

        return successResponse({ user });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

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

        // Prevent user from deleting themselves
        if (id === decoded.userId) {
            return errorResponse('Cannot delete yourself', 400);
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        return successResponse({ message: 'User deleted successfully' });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
