import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { OrderNote } from '@/models/OrderNote';
import { verifyToken } from '@/lib/auth';

const noteSchema = z.object({
    note: z.string().min(1, 'Note content is required'),
    noteType: z.enum(['info', 'warning', 'important']).optional(),
});

// GET: Fetch all notes for an order
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload: any = verifyToken(token);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const notes = await OrderNote.find({ orderId: params.id, isVisible: true })
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: { notes }
        });
    } catch (error: any) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch notes' },
            { status: 500 }
        );
    }
}

// POST: Add a new note to an order
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload: any = verifyToken(token);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = noteSchema.parse(body);

        const note = await OrderNote.create({
            orderId: params.id,
            adminId: payload.userId,
            ...validatedData
        });

        const populatedNote = await OrderNote.findById(note._id)
            .populate('adminId', 'name email');

        return NextResponse.json({
            success: true,
            data: { note: populatedNote }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating note:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to create note' },
            { status: 500 }
        );
    }
}
