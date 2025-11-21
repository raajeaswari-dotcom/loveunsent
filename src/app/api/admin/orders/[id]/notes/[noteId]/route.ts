import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { OrderNote } from '@/models/OrderNote';
import { verifyToken } from '@/lib/auth';

// DELETE: Remove a note
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; noteId: string } }
) {
    try {
        await connectDB();

        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        // Soft delete by marking as invisible
        const note = await OrderNote.findByIdAndUpdate(
            params.noteId,
            { isVisible: false },
            { new: true }
        );

        if (!note) {
            return NextResponse.json(
                { success: false, message: 'Note not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete note' },
            { status: 500 }
        );
    }
}
