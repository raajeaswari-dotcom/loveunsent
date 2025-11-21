import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { ShippingRate } from '@/models/ShippingRate';
import { verifyToken } from '@/lib/auth';

const shippingRateUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    carrier: z.string().min(1).optional(),
    description: z.string().optional(),
    baseRate: z.number().min(0).optional(),
    perKmRate: z.number().min(0).optional(),
    deliveryDays: z.number().min(1).optional(),
    maxWeight: z.number().min(0).optional(),
    zones: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});

// GET: Fetch single shipping rate by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const shippingRate = await ShippingRate.findById(params.id);

        if (!shippingRate) {
            return NextResponse.json(
                { success: false, message: 'Shipping rate not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { shippingRate }
        });
    } catch (error: any) {
        console.error('Error fetching shipping rate:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch shipping rate' },
            { status: 500 }
        );
    }
}

// PUT: Update shipping rate (Super Admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
        const validatedData = shippingRateUpdateSchema.parse(body);

        // If setting as default, unset other defaults
        if (validatedData.isDefault) {
            await ShippingRate.updateMany({}, { isDefault: false });
        }

        const shippingRate = await ShippingRate.findByIdAndUpdate(
            params.id,
            validatedData,
            { new: true, runValidators: true }
        );

        if (!shippingRate) {
            return NextResponse.json(
                { success: false, message: 'Shipping rate not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { shippingRate }
        });
    } catch (error: any) {
        console.error('Error updating shipping rate:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to update shipping rate' },
            { status: 500 }
        );
    }
}

// DELETE: Soft delete shipping rate (Super Admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

        const shippingRate = await ShippingRate.findByIdAndUpdate(
            params.id,
            { isActive: false },
            { new: true }
        );

        if (!shippingRate) {
            return NextResponse.json(
                { success: false, message: 'Shipping rate not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Shipping rate marked as inactive',
            data: { shippingRate }
        });
    } catch (error: any) {
        console.error('Error deleting shipping rate:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete shipping rate' },
            { status: 500 }
        );
    }
}
