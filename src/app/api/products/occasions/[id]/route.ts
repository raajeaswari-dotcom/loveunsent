import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { Occasion } from '@/models/Definitions';
import { verifyToken } from '@/lib/auth';

const occasionUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    slug: z.string().min(1, 'Slug is required').toLowerCase().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    displayOrder: z.number().optional(),
});

// GET: Fetch single occasion by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const occasion = await Occasion.findById(params.id);

        if (!occasion) {
            return NextResponse.json(
                { success: false, message: 'Occasion not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { occasion }
        });
    } catch (error: any) {
        console.error('Error fetching occasion:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch occasion' },
            { status: 500 }
        );
    }
}

// PUT: Update occasion (Super Admin only)
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
        const validatedData = occasionUpdateSchema.parse(body);

        // If slug is being updated, check for duplicates
        if (validatedData.slug) {
            const existingOccasion = await Occasion.findOne({
                slug: validatedData.slug,
                _id: { $ne: params.id }
            });
            if (existingOccasion) {
                return NextResponse.json(
                    { success: false, message: 'Occasion with this slug already exists' },
                    { status: 400 }
                );
            }
        }

        const occasion = await Occasion.findByIdAndUpdate(
            params.id,
            validatedData,
            { new: true, runValidators: true }
        );

        if (!occasion) {
            return NextResponse.json(
                { success: false, message: 'Occasion not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { occasion }
        });
    } catch (error: any) {
        console.error('Error updating occasion:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to update occasion' },
            { status: 500 }
        );
    }
}

// DELETE: Soft delete occasion (Super Admin only)
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

        const occasion = await Occasion.findByIdAndUpdate(
            params.id,
            { isActive: false },
            { new: true }
        );

        if (!occasion) {
            return NextResponse.json(
                { success: false, message: 'Occasion not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Occasion marked as inactive',
            data: { occasion }
        });
    } catch (error: any) {
        console.error('Error deleting occasion:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete occasion' },
            { status: 500 }
        );
    }
}
