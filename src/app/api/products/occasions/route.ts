import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { Occasion } from '@/models/Definitions';
import { verifyToken } from '@/lib/auth';

const occasionSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').toLowerCase(),
    icon: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    displayOrder: z.number().optional(),
});

// GET: Fetch all occasions (public gets active only, admin gets all)
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
        const occasions = await Occasion.find(filter).sort({ displayOrder: 1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: { occasions }
        });
    } catch (error: any) {
        console.error('Error fetching occasions:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch occasions' },
            { status: 500 }
        );
    }
}

// POST: Create new occasion (Super Admin only)
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
        const validatedData = occasionSchema.parse(body);

        // Check if slug already exists
        const existingOccasion = await Occasion.findOne({ slug: validatedData.slug });
        if (existingOccasion) {
            return NextResponse.json(
                { success: false, message: 'Occasion with this slug already exists' },
                { status: 400 }
            );
        }

        const occasion = await Occasion.create(validatedData);

        return NextResponse.json({
            success: true,
            data: { occasion }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating occasion:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to create occasion' },
            { status: 500 }
        );
    }
}
