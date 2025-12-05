
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import PDFDocument from 'pdfkit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const order: any = await Order.findById(params.id)
            .populate('customerId')
            .populate('paperId')
            .populate('perfumeId')
            .populate('handwritingStyleId');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });
        const chunks: any[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        // Header
        doc.fontSize(20).text('LOVE UNSENT', { align: 'center' });
        doc.fontSize(10).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Order Details
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${order.workflowState.replace(/_/g, ' ')}`);
        doc.moveDown();

        // Customer Details
        doc.text('Bill To:', { underline: true });
        doc.text(order.customerId?.name || 'N/A');
        doc.text(order.customerId?.email || 'N/A');
        doc.text(order.customerId?.phone || 'N/A');
        doc.moveDown();

        // Shipping Address
        doc.text('Ship To:', { underline: true });
        doc.text(order.shippingAddress?.fullName);
        doc.text(order.shippingAddress?.addressLine1);
        if (order.shippingAddress?.addressLine2) doc.text(order.shippingAddress.addressLine2);
        doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`);
        doc.text(`Phone: ${order.shippingAddress?.phone}`);
        doc.moveDown();

        // Items Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Price', 400, tableTop, { width: 90, align: 'right' });
        doc.font('Helvetica');
        doc.moveDown();

        // Items
        let y = doc.y;

        // Paper
        if (order.paperId) {
            doc.text(`Paper: ${order.paperId.name}`, 50, y);
            doc.text(`₹${order.paperId.price || 0}`, 400, y, { width: 90, align: 'right' });
            y += 20;
        }

        // Perfume
        if (order.perfumeId) {
            doc.text(`Perfume: ${order.perfumeId.name}`, 50, y);
            doc.text(`₹${order.perfumeId.price || 0}`, 400, y, { width: 90, align: 'right' });
            y += 20;
        }

        // Handwriting
        if (order.handwritingStyleId) {
            doc.text(`Style: ${order.handwritingStyleId.name}`, 50, y);
            doc.text(`-`, 400, y, { width: 90, align: 'right' });
            y += 20;
        }

        // Total
        doc.moveDown();
        doc.font('Helvetica-Bold');
        doc.text('Total', 300, doc.y);
        doc.text(`₹${order.price}`, 400, doc.y, { width: 90, align: 'right' });

        doc.end();

        // Wait for PDF generation to finish
        const pdfBuffer = await new Promise<Buffer>((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="invoice-${order._id}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Error generating invoice:', error);
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
    }
}
