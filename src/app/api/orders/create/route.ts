import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { Paper } from '@/models/Paper';
import { Handwriting } from '@/models/Handwriting';
import { Perfume } from '@/models/Perfume';
import { Addon } from '@/models/Addon';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { triggerNotification } from '@/lib/notificationService';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

const orderItemSchema = z.object({
    paperId: z.string(),
    handwritingStyleId: z.string(),
    perfumeId: z.string().optional(),
    addOns: z.array(z.string()).optional(),
    messageContent: z.string().optional(),
    voiceNoteUrl: z.string().optional(),
    wordCount: z.number().optional(),
});

const createOrderSchema = z.object({
    items: z.array(orderItemSchema),
    shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string()
    })
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);
        const decoded: any = verifyToken(token);
        if (!decoded) return errorResponse('Invalid Token', 401);

        const body = await req.json();
        const result = createOrderSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { items, shippingAddress } = result.data;

        // Calculate Total Price
        let totalAmount = 0;
        const enrichedItems = [];

        for (const item of items) {
            const paper = await Paper.findById(item.paperId);
            const style = await Handwriting.findById(item.handwritingStyleId);
            if (!paper || !style) return errorResponse('Invalid Product ID', 400);

            let itemPrice = (paper.priceExtra || 0) + (style.priceExtra || 0) + 99; // Base price 99

            if (item.perfumeId) {
                const perfume = await Perfume.findById(item.perfumeId);
                if (perfume) itemPrice += (perfume.priceExtra || 0);
            }

            if (item.addOns && item.addOns.length > 0) {
                const addons = await Addon.find({ _id: { $in: item.addOns } });
                addons.forEach(addon => itemPrice += (addon.price || 0));
            }

            totalAmount += itemPrice;
            enrichedItems.push({
                ...item,
                paper: item.paperId, // Map to schema field name if needed, or use direct ID
                style: item.handwritingStyleId,
                price: itemPrice
            });
        }

        // Create Razorpay Order
        const paymentOrder = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}_${decoded.userId.substring(0, 5)}`
        });

        // Create DB Order (Assuming single item per order for simplicity based on schema, or loop if multi-order)
        const createdOrders = [];
        for (const item of enrichedItems) {
            const newOrder = await Order.create({
                customerId: decoded.userId,
                paperId: item.paperId,
                handwritingStyleId: item.handwritingStyleId,
                perfumeId: item.perfumeId,
                addOns: item.addOns,
                message: item.messageContent,
                voiceNoteURL: item.voiceNoteUrl,
                wordCount: item.wordCount,
                price: item.price,
                status: 'pending_payment',
                workflowState: 'pending_payment',
                payment: {
                    razorpayOrderId: paymentOrder.id,
                    status: 'pending'
                },
                shippingAddress
            });
            createdOrders.push(newOrder);
            // Trigger Notification (Async - don't await to speed up response)
            triggerNotification('order_placed', newOrder).catch(console.error);
        }

        return successResponse({
            orders: createdOrders.map(o => o._id),
            razorpayOrderId: paymentOrder.id,
            totalAmount
        }, 201);

    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
