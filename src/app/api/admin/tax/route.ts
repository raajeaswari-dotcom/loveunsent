import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { TaxConfig } from '@/models/TaxConfig';
import { verifyToken } from '@/lib/auth';

const taxConfigSchema = z.object({
    taxType: z.enum(['GST', 'IGST', 'CGST', 'SGST', 'CUSTOM']),
    taxName: z.string().min(1, 'Tax name is required'),
    taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
    applicableStates: z.array(z.string()).optional(),
    hsnCode: z.string().optional(),
    description: z.string().optional(),
    effectiveFrom: z.string().transform((val) => new Date(val)),
    effectiveTo: z.string().transform((val) => new Date(val)).optional(),
});

// GET: Fetch all tax configs (public gets active only, admin gets all)
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

        const now = new Date();
        const filter = isAdmin ? {} : {
            isActive: true,
            effectiveFrom: { $lte: now },
            $or: [
                { effectiveTo: { $gte: now } },
                { effectiveTo: null }
            ]
        };

        const taxConfigs = await TaxConfig.find(filter).sort({ effectiveFrom: -1 });

        return NextResponse.json({
            success: true,
            data: { taxConfigs }
        });
    } catch (error: any) {
        console.error('Error fetching tax configs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tax configs' },
            { status: 500 }
        );
    }
}

// POST: Create new tax config (Super Admin only)
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
        const validatedData = taxConfigSchema.parse(body);

        const taxConfig = await TaxConfig.create(validatedData);

        return NextResponse.json({
            success: true,
            data: { taxConfig }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating tax config:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to create tax config' },
            { status: 500 }
        );
    }
}
