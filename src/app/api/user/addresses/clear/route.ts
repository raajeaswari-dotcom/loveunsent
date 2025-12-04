import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// DELETE ALL - Clear all addresses for the authenticated user
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return errorResponse('Not authenticated', 401);
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return errorResponse('Invalid token', 401);
        }

        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return errorResponse('User ID not found in token', 401);
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Clear all addresses
        user.addresses = [];
        await user.save();

        return successResponse({
            message: 'All addresses cleared successfully',
            addresses: []
        });
    } catch (error: any) {
        console.error('DELETE all addresses error:', error);
        return errorResponse(error.message, 500);
    }
}
