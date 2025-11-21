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
        }

        // Generate PDF invoice
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Customer ID: ${order.customerId}`);
        doc.text(`Paper: ${order.paperId?.name ?? ''}`);
        doc.text(`Handwriting Style: ${order.handwritingStyleId?.name ?? ''}`);
        doc.text(`Perfume: ${order.perfumeId?.name ?? ''}`);
        doc.text(`Price: ${order.price} ${order.currency}`);
        doc.end();

        const pdfBuffer = Buffer.concat(buffers);
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${order._id}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Invoice generation error:', error);
        return new NextResponse('Error generating invoice', { status: 500 });
    }
}
