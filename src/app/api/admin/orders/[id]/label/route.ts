
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import PDFDocument from 'pdfkit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const order: any = await Order.findById(params.id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Create a PDF document (Label size roughly 4x6 inches)
        const doc = new PDFDocument({ size: [288, 432], margin: 20 }); // 4x6 inches in points
        const chunks: any[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        // Sender Address (Love Unsent)
        doc.fontSize(8).text('From:', 20, 20);
        doc.font('Helvetica-Bold').fontSize(10).text('Love Unsent');
        doc.font('Helvetica').fontSize(8).text('123 Love Lane, Heart City, 560001');
        doc.text('Phone: +91 9876543210');

        doc.moveDown();
        doc.moveTo(20, doc.y).lineTo(268, doc.y).stroke();
        doc.moveDown();

        // Recipient Address
        doc.fontSize(10).text('To:', 20, doc.y);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(14).text(order.shippingAddress?.fullName);
        doc.font('Helvetica').fontSize(12);
        doc.text(order.shippingAddress?.addressLine1);
        if (order.shippingAddress?.addressLine2) doc.text(order.shippingAddress.addressLine2);
        doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state}`);
        doc.font('Helvetica-Bold').text(order.shippingAddress?.pincode);
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10).text(`Phone: ${order.shippingAddress?.phone}`);

        // Order Info
        doc.moveDown();
        doc.moveTo(20, doc.y).lineTo(268, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(8).text(`Order ID: ${order._id}`);
        if (order.payment?.method === 'cod') {
            doc.font('Helvetica-Bold').fontSize(14).text('COD: ₹' + order.price, { align: 'center' });
        } else {
            doc.font('Helvetica-Bold').fontSize(12).text('PREPAID', { align: 'center' });
        }

        doc.end();

        // Wait for PDF generation to finish
        const pdfBuffer = await new Promise<Buffer>((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="label-${order._id}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Error generating label:', error);
        return NextResponse.json({ error: 'Failed to generate label' }, { status: 500 });
    }
}
