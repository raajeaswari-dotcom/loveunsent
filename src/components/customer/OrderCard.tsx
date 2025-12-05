"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Package, Truck, FileText } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderTimeline from './OrderTimeline';
import Link from 'next/link';

interface OrderCardProps {
    order: {
        _id: string;
        orderId: string;
        createdAt: string;
        workflowStatus: string; // Note: Schema uses workflowState, but frontend seems to use workflowStatus? Need to check.
        // Actually, let's check what the API returns. API returns `orders` from `Order.find()`.
        // The schema has `workflowState`.
        // OrderCard uses `workflowStatus`.
        // I should check if the API maps it.
        paymentStatus: string;
        totalAmount: number;
        paperId?: { name: string };
        handwritingStyleId?: { name: string };
        perfumeId?: { name: string };
        shippingAddress?: {
            fullName: string;
            addressLine1: string;
            city: string;
            state: string;
            pincode: string;
        };
        trackingId?: string;
        courierPartner?: string;
        requestedDeliveryDate?: string;
    };
    onCancel?: (orderId: string) => void;
}

export default function OrderCard({ order, onCancel }: OrderCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Schema has workflowState, but let's see if we need to map it.
    // If the API returns raw mongoose document, it has workflowState.
    // But OrderCard uses workflowStatus.
    // Let's assume for now we need to use workflowState if workflowStatus is undefined.
    const status = (order as any).workflowState || order.workflowStatus;

    const canCancel = ['payment_pending', 'payment_completed', 'pending_payment'].includes(status);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg">Order #{order.orderId || (order as any)._id.substring(0, 8)}</h3>
                            <OrderStatusBadge status={status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">₹{(order as any).price || order.totalAmount}</span>
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-2 mb-4">
                    {order.paperId && (
                        <p className="text-sm">
                            <span className="font-medium">Paper:</span> {(order.paperId as any).name || 'Default'}
                        </p>
                    )}
                    {order.handwritingStyleId && (
                        <p className="text-sm">
                            <span className="font-medium">Style:</span> {(order.handwritingStyleId as any).name || 'Default'}
                        </p>
                    )}
                    {order.perfumeId && (
                        <p className="text-sm">
                            <span className="font-medium">Perfume:</span> {(order.perfumeId as any).name || 'None'}
                        </p>
                    )}
                </div>

                {/* Tracking Info */}
                {order.trackingId && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                                {order.courierPartner || 'Courier'}
                            </p>
                            <p className="text-xs text-blue-700">Tracking: {order.trackingId}</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                            <a href={`https://www.example.com/track/${order.trackingId}`} target="_blank" rel="noopener noreferrer">
                                Track
                            </a>
                        </Button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="gap-2"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {expanded ? 'Hide' : 'View'} Details
                    </Button>

                    {(order.workflowStatus === 'delivered' || (order as any).payment?.status === 'captured' || (order as any).workflowState === 'paid' || (order as any).workflowState === 'payment_completed') && (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={`/api/orders/${order._id}/invoice`} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4" />
                                Invoice
                            </a>
                        </Button>
                    )}

                    {canCancel && onCancel && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onCancel(order._id)}
                        >
                            Cancel Order
                        </Button>
                    )}
                </div>

                {/* Expanded Details */}
                {expanded && (
                    <div className="border-t pt-4 space-y-4">
                        {/* Order Timeline */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Order Progress
                            </h4>
                            <OrderTimeline currentStatus={status} />
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div>
                                <h4 className="font-semibold mb-2">Shipping Address</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Delivery Date */}
                        {order.requestedDeliveryDate && (
                            <div>
                                <h4 className="font-semibold mb-2">Expected Delivery</h4>
                                <p className="text-sm text-gray-600">
                                    {new Date(order.requestedDeliveryDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
