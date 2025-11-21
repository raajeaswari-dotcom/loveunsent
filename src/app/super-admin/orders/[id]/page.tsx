"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OrderNotes from '@/components/admin/OrderNotes';
import OrderTimeline from '@/components/admin/OrderTimeline';
import Link from 'next/link';
import {
    ArrowLeft,
    Package,
    User,
    CreditCard,
    MapPin,
    Truck,
    FileText,
    Download,
    Edit,
    XCircle,
    Loader2
} from 'lucide-react';

interface Order {
    _id: string;
    customerId: { name: string; email: string; phone: string };
    workflowState: string;
    payment: {
        status: string;
        method: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        amount: number;
    };
    price: number;
    createdAt: string;
    updatedAt: string;
    writerId?: { name: string; email: string };
    paperId?: { name: string; price: number };
    perfumeId?: { name: string; price: number };
    handwritingStyleId?: { name: string };
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        pincode: string;
    };
    trackingId?: string;
    courierPartner?: string;
    requestedDeliveryDate?: string;
    letterContent?: string;
}

export default function SuperAdminOrderDetailsPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingTracking, setEditingTracking] = useState(false);
    const [trackingData, setTrackingData] = useState({ trackingId: '', courierPartner: '' });

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/admin/orders/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setOrder(data.data);
                setTrackingData({
                    trackingId: data.data.trackingId || '',
                    courierPartner: data.data.courierPartner || ''
                });
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTracking = async () => {
        // TODO: Implement tracking update API
        alert('Tracking update feature coming soon');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'default';
            case 'cancelled':
                return 'destructive';
            case 'shipped':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">Order Not Found</h2>
                <Link href="/super-admin/orders">
                    <Button className="mt-4">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/super-admin/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Order #{order._id.slice(-8)}</h1>
                    <p className="text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                    </p>
                </div>
                <Badge variant={getStatusColor(order.workflowState) as any} className="text-lg px-4 py-1">
                    {order.workflowState.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="font-medium">{order.customerId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{order.customerId?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="font-medium">{order.customerId?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Paper</Label>
                                    <p className="font-medium">{order.paperId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Handwriting Style</Label>
                                    <p className="font-medium">{order.handwritingStyleId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Perfume</Label>
                                    <p className="font-medium">{order.perfumeId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Writer</Label>
                                    <p className="font-medium">{order.writerId?.name || 'Unassigned'}</p>
                                </div>
                            </div>
                            {order.letterContent && (
                                <div className="mt-4">
                                    <Label className="text-muted-foreground">Letter Content</Label>
                                    <div className="mt-2 p-4 bg-muted/30 rounded-lg border">
                                        <p className="whitespace-pre-wrap">{order.letterContent}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge variant={order.payment?.status === 'captured' ? 'default' : 'secondary'}>
                                        {order.payment?.status || 'N/A'}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Method</Label>
                                    <p className="font-medium">{order.payment?.method || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Amount</Label>
                                    <p className="font-medium text-lg">{formatCurrency(order.price)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Payment ID</Label>
                                    <p className="font-mono text-sm">{order.payment?.razorpayPaymentId || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                                <p>{order.shippingAddress?.addressLine1}</p>
                                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                <p>
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                </p>
                                <p className="text-muted-foreground">Phone: {order.shippingAddress?.phone}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping & Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Shipping & Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editingTracking ? (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Tracking ID</Label>
                                        <Input
                                            value={trackingData.trackingId}
                                            onChange={(e) => setTrackingData({ ...trackingData, trackingId: e.target.value })}
                                            placeholder="Enter tracking ID"
                                        />
                                    </div>
                                    <div>
                                        <Label>Courier Partner</Label>
                                        <Input
                                            value={trackingData.courierPartner}
                                            onChange={(e) => setTrackingData({ ...trackingData, courierPartner: e.target.value })}
                                            placeholder="e.g., BlueDart, DTDC"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleUpdateTracking}>Save</Button>
                                        <Button variant="outline" onClick={() => setEditingTracking(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-muted-foreground">Tracking ID</Label>
                                        <p className="font-medium">{order.trackingId || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Courier Partner</Label>
                                        <p className="font-medium">{order.courierPartner || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Requested Delivery</Label>
                                        <p className="font-medium">
                                            {order.requestedDeliveryDate
                                                ? new Date(order.requestedDeliveryDate).toLocaleDateString('en-IN')
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setEditingTracking(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Update Tracking
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Internal Notes */}
                    <OrderNotes orderId={order._id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <OrderTimeline
                        workflowState={order.workflowState}
                        createdAt={order.createdAt}
                        updatedAt={order.updatedAt}
                    />

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Download Invoice
                            </Button>
                            <Button variant="outline" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Label
                            </Button>
                            <Button variant="destructive" className="w-full">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
