import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Order } from '@/models/Order';
import { Paper } from '@/models/Paper';
import { Handwriting } from '@/models/Handwriting';
import { Perfume } from '@/models/Perfume';
import { Addon } from '@/models/Addon';
import { User } from '@/models/User';
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
    perfumeId: z.string().optional().nullable(),
    addOns: z.array(z.string()).optional().nullable(),
    messageContent: z.string().optional().nullable(),
    voiceNoteUrl: z.string().optional().nullable(),
    wordCount: z.number().optional().nullable(),
    inkColor: z.string().optional().nullable(),
});

const createOrderSchema = z.object({
    items: z.array(orderItemSchema),
    paymentMethod: z.enum(['cod', 'online']).optional(),
    shippingAddress: z.object({
        fullName: z.string(),
        phone: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
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

        // Amazon-style: Check email verification before allowing order
        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Require email verification for placing orders (Amazon approach)
        if (!user.emailVerified && !user.phoneVerified) {
            return errorResponse(
                'Please verify your email or phone number to place orders. This helps us send you order confirmations and updates.',
                403,
                {
                    requiresVerification: true,
                    email: user.email,
                    phone: user.phone
                }
            );
        }

        const body = await req.json();
        console.log('Order creation request body:', JSON.stringify(body, null, 2));

        const result = createOrderSchema.safeParse(body);
        if (!result.success) {
            console.error('Validation failed:', result.error.format());
            return errorResponse('Validation Error', 400, result.error.format());
        }

        const { items, shippingAddress } = result.data;
        console.log('Validated shipping address:', shippingAddress);

        // Calculate Total Price
        let totalAmount = 0;
        const enrichedItems = [];

        for (const item of items) {
            // Handle default values - fetch first available if "ordinary", "default" or invalid ObjectId
            let paperId = item.paperId;
            let handwritingStyleId = item.handwritingStyleId;

            if (!paperId || paperId === 'ordinary' || !mongoose.Types.ObjectId.isValid(paperId)) {
                const firstPaper = await Paper.findOne().sort({ createdAt: 1 });
                if (!firstPaper) return errorResponse('No paper options available', 400);
                paperId = firstPaper._id.toString();
            }

            if (!handwritingStyleId || handwritingStyleId === 'default' || !mongoose.Types.ObjectId.isValid(handwritingStyleId)) {
                const firstStyle = await Handwriting.findOne().sort({ createdAt: 1 });
                if (!firstStyle) return errorResponse('No handwriting styles available', 400);
                handwritingStyleId = firstStyle._id.toString();
            }

            const paper = await Paper.findById(paperId);
            const style = await Handwriting.findById(handwritingStyleId);
            if (!paper || !style) return errorResponse('Invalid Product ID', 400);

            let itemPrice = (paper.priceExtra || 0) + (style.priceExtra || 0) + 99; // Base price 99

            if (item.perfumeId && mongoose.Types.ObjectId.isValid(item.perfumeId)) {
                const perfume = await Perfume.findById(item.perfumeId);
                if (perfume) itemPrice += (perfume.priceExtra || 0);
            }

            if (item.addOns && item.addOns.length > 0) {
                // Filter out invalid ObjectIds
                const validAddonIds = item.addOns.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

                if (validAddonIds.length > 0) {
                    const addons = await Addon.find({ _id: { $in: validAddonIds } });
                    addons.forEach(addon => itemPrice += (addon.price || 0));

                    // Update item.addOns to only include valid IDs
                    item.addOns = validAddonIds;
                } else {
                    item.addOns = [];
                }
            } else {
                item.addOns = [];
            }

            totalAmount += itemPrice;
            enrichedItems.push({
                ...item,
                paperId: paperId,
                handwritingStyleId: handwritingStyleId,
                paper: paperId, // Map to schema field name if needed, or use direct ID
                style: handwritingStyleId,
                price: itemPrice
            });
        }

        // Create Payment Order (Razorpay or COD placeholder)
        const { paymentMethod } = result.data;
        let paymentOrder;

        if (paymentMethod === 'cod') {
            paymentOrder = {
                id: `cod_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                amount: totalAmount * 100,
                currency: 'INR',
                status: 'pending'
            };
        } else {
            // TODO: Integrate Razorpay properly with valid API keys
            try {
                paymentOrder = await razorpay.orders.create({
                    amount: totalAmount * 100,
                    currency: 'INR',
                    receipt: `rcpt_${Date.now()}_${userId.substring(0, 5)}`
                });
            } catch (razorpayError: any) {
                console.error('Razorpay error (skipping for now):', razorpayError);
                // Use placeholder for now - payment will be handled separately
                paymentOrder = {
                    id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    amount: totalAmount * 100,
                    currency: 'INR'
                };
            }
        }

        // Create DB Order (Assuming single item per order for simplicity based on schema, or loop if multi-order)
        const createdOrders = [];
        for (const item of enrichedItems) {
            const newOrder = await Order.create({
                customerId: userId,
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
                    status: 'pending',
                    method: paymentMethod || 'online'
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
        console.error('Order creation error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        return errorResponse(error.message || 'Failed to create order', 500);
    }
}
