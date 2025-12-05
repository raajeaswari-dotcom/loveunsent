import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

        // Handle both 'userId' and 'id' field names for backward compatibility
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            console.error('Profile GET - No user ID in token:', decoded);
            return errorResponse('Invalid token: missing user ID', 401);
        }

        console.log('Profile GET - User ID:', userId);

        const user = await User.findById(userId).select('-password');
        if (!user) {
            console.error('Profile GET - User not found:', userId);
            return errorResponse('User not found', 404);
        }

        return successResponse({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                addresses: user.addresses,
                // Optional personal information
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                preferredLanguage: user.preferredLanguage,
                alternatePhone: user.alternatePhone,
            }
        });
    } catch (error: any) {
        console.error('Profile GET error:', error);
        return errorResponse(error.message, 500);
    }
}

export async function PUT(req: NextRequest) {
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

        // Handle both 'userId' and 'id' field names for backward compatibility
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            console.error('Profile PUT - No user ID in token:', decoded);
            return errorResponse('Invalid token: missing user ID', 401);
        }

        console.log('Profile PUT - User ID:', userId);

        const body = await req.json();
        const { name, addresses, dateOfBirth, gender, preferredLanguage, alternatePhone } = body;

        console.log('Profile PUT - Update data:', { name, addressCount: addresses?.length });

        const updateData: any = {};
        if (name) updateData.name = name;
        if (addresses) updateData.addresses = addresses;
        // Optional fields - allow null to clear them
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updateData.gender = gender;
        if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
        if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone;

        console.log('Profile PUT - Updating user with:', updateData);

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            console.error('Profile PUT - User not found:', userId);
            return errorResponse('User not found', 404);
        }

        console.log('Profile PUT - User updated successfully:', {
            userId: user._id,
            name: user.name,
            addressCount: user.addresses?.length
        });

        return successResponse({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                addresses: user.addresses,
                // Optional personal information
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                preferredLanguage: user.preferredLanguage,
                alternatePhone: user.alternatePhone,
            }
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return errorResponse(error.message || 'Failed to update profile', 500);
    }
}
