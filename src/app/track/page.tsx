"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, Search } from 'lucide-react';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [tracking, setTracking] = useState<any>(null);

    const handleTrack = () => {
        // Mock tracking data
        setTracking({
            orderId: orderId,
            status: 'in_transit',
            timeline: [
                { status: 'Order Placed', date: '2025-11-18', completed: true },
                { status: 'Writer Assigned', date: '2025-11-18', completed: true },
                { status: 'Writing in Progress', date: '2025-11-19', completed: true },
                { status: 'QC Review', date: '2025-11-19', completed: true },
                { status: 'Shipped', date: '2025-11-20', completed: true },
                { status: 'Out for Delivery', date: 'Expected Today', completed: false },
                { status: 'Delivered', date: 'Pending', completed: false },
            ]
        });
    };

    return (
        <div className="container max-w-4xl py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold mb-4">Track Your Order</h1>
                <p className="text-muted-foreground">Enter your order ID to see the latest status</p>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Enter Order ID (e.g., ORD-12345)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleTrack} disabled={!orderId}>
                            <Search className="w-4 h-4 mr-2" />
                            Track
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {tracking && (
                <Card>
                    <CardHeader>
                        <CardTitle>Order {tracking.orderId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {tracking.timeline.map((item: any, index: number) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            {item.completed ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : index === tracking.timeline.findIndex((t: any) => !t.completed) ? (
                                                <Truck className="w-5 h-5" />
                                            ) : (
                                                <Package className="w-5 h-5" />
                                            )}
                                        </div>
                                        {index < tracking.timeline.length - 1 && (
                                            <div className={`w-0.5 h-12 ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <h3 className={`font-semibold ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {item.status}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!tracking && (
                <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Enter your order ID above to track your order</p>
                </div>
            )}
        </div>
    );
}
