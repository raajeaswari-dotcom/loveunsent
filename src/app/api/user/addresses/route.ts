import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// GET - Fetch all addresses for the authenticated user
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

        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return errorResponse('User ID not found in token', 401);
        }

        const user = await User.findById(userId).select('addresses');
        if (!user) {
            return errorResponse('User not found', 404);
        }

        return successResponse({ addresses: user.addresses || [] });
    } catch (error: any) {
        console.error('GET addresses error:', error);
        return errorResponse(error.message, 500);
    }
}

// POST - Add a new address
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

        const body = await req.json();
        console.log('Received address data:', body); // Debug log

        const {
            recipientName,
            recipientPhone,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            country,
            isDefault
        } = body;

        // Validate required fields
        if (!recipientName || !recipientPhone || !addressLine1 || !city || !state || !pincode) {
            console.log('Validation failed - missing fields:', {
                recipientName: !!recipientName,
                recipientPhone: !!recipientPhone,
                addressLine1: !!addressLine1,
                city: !!city,
                state: !!state,
                pincode: !!pincode
            });
            return errorResponse('Missing required address fields', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
        }

        // Add new address
        const newAddress = {
            recipientName,
            recipientPhone,
            addressLine1,
            addressLine2: addressLine2 || '',
            landmark: landmark || '',
            city,
            state,
            pincode,
            country: country || 'India',
            isDefault: isDefault || false
        };

        console.log('New address object:', JSON.stringify(newAddress, null, 2));

        // Clean up existing invalid addresses (migration fix)
        // This removes any address that doesn't have the required new schema fields
        if (user.addresses && user.addresses.length > 0) {
            user.addresses = user.addresses.filter((addr: any) =>
                addr.recipientName &&
                addr.recipientPhone &&
                addr.addressLine1 &&
                addr.city &&
                addr.state &&
                addr.pincode
            );
        }

        user.addresses.push(newAddress);

        console.log('Addresses array after push:', user.addresses.length);

        try {
            // Use validateModifiedOnly to avoid validating existing addresses with old schema
            await user.save({ validateModifiedOnly: true });
            console.log('Address saved successfully!');
        } catch (saveError: any) {
            console.error('Mongoose save error:', saveError.message);
            console.error('Error name:', saveError.name);

            // Handle Mongoose validation errors
            if (saveError.name === 'ValidationError') {
                const errors = Object.values(saveError.errors).map((err: any) => err.message);
                console.error('Validation errors:', errors);
                return errorResponse(`Validation failed: ${errors.join(', ')}`, 400);
            }
            throw saveError;
        }

        // Get the ID of the newly added address
        const addedAddress = user.addresses[user.addresses.length - 1];

        return successResponse({
            message: 'Address added successfully',
            addressId: addedAddress._id,
            addresses: user.addresses
        }, 201);
    } catch (error: any) {
        console.error('POST address error:', error);

        // Log the full error for debugging
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
        }

        return errorResponse(error.message || 'Failed to add address', 500);
    }
}

// PUT - Update an existing address
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

        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return errorResponse('User ID not found in token', 401);
        }

        const body = await req.json();
        const { addressId, ...updateData } = body;

        if (!addressId) {
            return errorResponse('Address ID is required', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }

        const addressIndex = user.addresses.findIndex(
            (addr: any) => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return errorResponse('Address not found', 404);
        }

        // If setting as default, unset other defaults
        if (updateData.isDefault) {
            user.addresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
        }

        // Update the address
        Object.assign(user.addresses[addressIndex], updateData);
        await user.save();

        return successResponse({
            message: 'Address updated successfully',
            addresses: user.addresses
        });
    } catch (error: any) {
        console.error('PUT address error:', error);
        return errorResponse(error.message, 500);
    }
}

// DELETE - Remove an address
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

        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get('addressId');

        if (!addressId) {
            return errorResponse('Address ID is required', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }

        const initialLength = user.addresses.length;
        user.addresses = user.addresses.filter(
            (addr: any) => addr._id.toString() !== addressId
        );

        if (user.addresses.length === initialLength) {
            return errorResponse('Address not found', 404);
        }

        await user.save();

        return successResponse({
            message: 'Address deleted successfully',
            addresses: user.addresses
        });
    } catch (error: any) {
        console.error('DELETE address error:', error);
        return errorResponse(error.message, 500);
    }
}
