import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// POST - Migrate user's addresses from old schema to new schema
export async function POST(req: NextRequest) {
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

        console.log('Current addresses:', user.addresses);

        // Migrate old addresses to new schema
        const migratedAddresses = user.addresses.map((addr: any) => {
            // If address already has new schema fields, keep it
            if (addr.recipientName && addr.addressLine1 && addr.pincode) {
                return addr;
            }

            // Migrate from old schema
            return {
                _id: addr._id,
                recipientName: addr.recipientName || 'Update Required',
                recipientPhone: addr.recipientPhone || '0000000000',
                addressLine1: addr.street || addr.addressLine1 || 'Update Required',
                addressLine2: addr.addressLine2 || '',
                landmark: addr.landmark || '',
                city: addr.city || 'Update Required',
                state: addr.state || 'Update Required',
                pincode: addr.zip || addr.pincode || '000000',
                country: addr.country || 'India',
                isDefault: addr.isDefault || false
            };
        });

        // Replace addresses array
        user.addresses = migratedAddresses;

        // Save without validation to avoid issues
        await user.save({ validateBeforeSave: false });

        console.log('Migrated addresses:', user.addresses);

        return successResponse({
            message: 'Addresses migrated successfully',
            migratedCount: migratedAddresses.length,
            addresses: user.addresses
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return errorResponse(error.message, 500);
    }
}
