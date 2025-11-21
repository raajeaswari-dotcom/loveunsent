import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { TaxConfig } from '@/models/TaxConfig';
import { verifyToken } from '@/lib/auth';

const taxConfigUpdateSchema = z.object({
    taxType: z.enum(['GST', 'IGST', 'CGST', 'SGST', 'CUSTOM']).optional(),
    taxName: z.string().min(1).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    applicableStates: z.array(z.string()).optional(),
    hsnCode: z.string().optional(),
    description: z.string().optional(),
    effectiveFrom: z.string().transform((val) => new Date(val)).optional(),
    effectiveTo: z.string().transform((val) => new Date(val)).optional(),
    isActive: z.boolean().optional(),
});

// GET: Fetch single tax config by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const taxConfig = await TaxConfig.findById(params.id);

        if (!taxConfig) {
            return NextResponse.json(
                { success: false, message: 'Tax config not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { taxConfig }
        });
    } catch (error: any) {
        console.error('Error fetching tax config:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tax config' },
            { status: 500 }
        );
    }
}

// PUT: Update tax config (Super Admin only)
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
        const validatedData = taxConfigUpdateSchema.parse(body);

        const taxConfig = await TaxConfig.findByIdAndUpdate(
            params.id,
            validatedData,
            { new: true, runValidators: true }
        );

        if (!taxConfig) {
            return NextResponse.json(
                { success: false, message: 'Tax config not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { taxConfig }
        });
    } catch (error: any) {
        console.error('Error updating tax config:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to update tax config' },
            { status: 500 }
        );
    }
}

// DELETE: Soft delete tax config (Super Admin only)
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

        const taxConfig = await TaxConfig.findByIdAndUpdate(
            params.id,
            { isActive: false },
            { new: true }
        );

        if (!taxConfig) {
            return NextResponse.json(
                { success: false, message: 'Tax config not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Tax config marked as inactive',
            data: { taxConfig }
        });
    } catch (error: any) {
        console.error('Error deleting tax config:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete tax config' },
            { status: 500 }
        );
    }
}
