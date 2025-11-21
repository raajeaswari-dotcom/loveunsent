import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { ShippingRate } from '@/models/ShippingRate';
import { verifyToken } from '@/lib/auth';

const shippingRateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    carrier: z.string().min(1, 'Carrier is required'),
    description: z.string().optional(),
    baseRate: z.number().min(0, 'Base rate must be positive'),
    perKmRate: z.number().min(0).optional(),
    deliveryDays: z.number().min(1, 'Delivery days must be at least 1'),
    maxWeight: z.number().min(0).optional(),
    zones: z.array(z.string()).optional(),
    isDefault: z.boolean().optional(),
});

// GET: Fetch all shipping rates (public gets active only, admin gets all)
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Check if request is from admin
        const token = req.headers.get('authorization')?.split(' ')[1];
        let isAdmin = false;

        if (token) {
            try {
                const payload = verifyToken(token);
                isAdmin = payload.role === 'admin' || payload.role === 'super_admin';
            } catch (error) {
                // Not admin, continue with public data
            }
        }

        const filter = isAdmin ? {} : { isActive: true };
        const shippingRates = await ShippingRate.find(filter).sort({ isDefault: -1, deliveryDays: 1 });

        return NextResponse.json({
            success: true,
            data: { shippingRates }
        });
    } catch (error: any) {
        console.error('Error fetching shipping rates:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch shipping rates' },
            { status: 500 }
        );
    }
}

// POST: Create new shipping rate (Super Admin only)
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Verify authentication and role
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (payload.role !== 'admin' && payload.role !== 'super_admin') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = shippingRateSchema.parse(body);

        // If setting as default, unset other defaults
        if (validatedData.isDefault) {
            await ShippingRate.updateMany({}, { isDefault: false });
        }

        const shippingRate = await ShippingRate.create(validatedData);

        return NextResponse.json({
            success: true,
            data: { shippingRate }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating shipping rate:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to create shipping rate' },
            { status: 500 }
        );
    }
}
