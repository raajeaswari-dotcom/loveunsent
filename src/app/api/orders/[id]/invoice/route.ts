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
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('LOVE UNSENT', { align: 'center' });
            doc.fontSize(16).text('INVOICE', { align: 'center' });
            doc.moveDown();

            // Meta
            doc.fontSize(10);
            doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
            doc.text(`Order ID: ${order.orderId || order._id}`, { align: 'right' });
            doc.moveDown();

            // Bill To
            doc.text('Bill To:', { underline: true });
            if (order.shippingAddress) {
                doc.text(order.shippingAddress.fullName);
                doc.text(order.shippingAddress.addressLine1);
                if (order.shippingAddress.addressLine2) doc.text(order.shippingAddress.addressLine2);
                doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`);
                doc.text(order.shippingAddress.country || 'India');
                doc.text(`Phone: ${order.shippingAddress.phone || order.shippingAddress.recipientPhone || 'N/A'}`);
            } else {
                doc.text('Address not available');
            }
            doc.moveDown();

            // Line Items
            const tableTop = doc.y;
            doc.text('Item', 50, tableTop, { underline: true });
            doc.text('Details', 200, tableTop, { underline: true });
            doc.text('Price', 450, tableTop, { underline: true, align: 'right' });
            doc.moveDown();

            let y = doc.y;

            // Letter
            doc.text('Handwritten Letter', 50, y);
            const details = [
                `Paper: ${order.paperId?.name || 'N/A'}`,
                `Style: ${order.handwritingStyleId?.name || 'N/A'}`,
                `Perfume: ${order.perfumeId?.name || 'None'}`
            ].join(', ');

            doc.text(details, 200, y, { width: 200 });
            doc.text(`${order.currency} ${order.price}`, 450, y, { align: 'right' });

            doc.moveDown(); // Space after item

            // Total
            doc.moveDown();
            const totalY = doc.y;
            doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount: ${order.currency} ${order.price}`, 350, totalY, { align: 'right' });

            // Payment Status
            doc.fontSize(10).text(`Payment Status: ${(order.payment?.status || 'Pending').toUpperCase()}`, 50, totalY + 20);

            doc.end();
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${order.orderId || order._id}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Invoice generation error:', error);
        return new NextResponse('Error generating invoice', { status: 500 });
    }
}
