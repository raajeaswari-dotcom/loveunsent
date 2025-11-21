import { z } from 'zod';

export const reassignWriterSchema = z.object({
    orderId: z.string(),
    writerId: z.string(),
    reason: z.string().optional()
});

export const issueRefundSchema = z.object({
    orderId: z.string(),
    amount: z.number().positive().optional(), // Partial refund supported
    reason: z.string().min(5, 'Reason is required')
});

export const createCouponSchema = z.object({
    code: z.string().min(3).max(20),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive(),
    minOrderValue: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().positive().optional(),
    validUntil: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().optional()
});

export const updateOrderStatusSchema = z.object({
    orderId: z.string(),
    status: z.enum(['packed', 'shipped', 'delivered', 'cancelled', 'on_hold']),
    trackingId: z.string().optional(),
    courierPartner: z.string().optional()
});

export const writerActionSchema = z.object({
    writerId: z.string(),
    action: z.enum(['approve', 'reject']),
    reason: z.string().optional()
});
