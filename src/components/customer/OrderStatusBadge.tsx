"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
    status: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'payment_pending': { label: 'Payment Pending', variant: 'outline' },
    'payment_completed': { label: 'Paid', variant: 'secondary' },
    'writer_assigned': { label: 'In Progress', variant: 'default' },
    'writing_in_progress': { label: 'In Progress', variant: 'default' },
    'draft_uploaded': { label: 'In Review', variant: 'default' },
    'qc_review': { label: 'In Review', variant: 'default' },
    'qc_approved': { label: 'Approved', variant: 'secondary' },
    'order_packed': { label: 'Packed', variant: 'secondary' },
    'order_shipped': { label: 'Shipped', variant: 'default' },
    'delivered': { label: 'Delivered', variant: 'secondary' },
    'cancelled': { label: 'Cancelled', variant: 'destructive' },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}
