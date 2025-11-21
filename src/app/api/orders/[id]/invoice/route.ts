import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import PDFDocument from 'pdfkit';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return new NextResponse('Invalid Token', { status: 401 });
        }

        const order = await Order.findById(params.id)
            .populate('paperId', 'name')
            .populate('handwritingStyleId', 'name')
            .populate('perfumeId', 'name');

        if (!order) {
            return new NextResponse('Order not found', { status: 404 });
        }

        // Verify ownership (unless admin/writer/qc)
        if (decoded.role === 'customer' && order.customerId.toString() !== decoded.userId) {
            return new NextResponse('Unauthorized', { status: 403 });
        } catch (error: any) {
            console.error('Invoice generation error:', error);
            return new NextResponse('Error generating invoice', { status: 500 });
        }
    }
