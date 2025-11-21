import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    // Mock Status
    const steps = [
        { status: 'Order Placed', date: 'Oct 25, 10:00 AM', completed: true },
        { status: 'Writer Assigned', date: 'Oct 25, 02:00 PM', completed: true },
        { status: 'Writing in Progress', date: 'Oct 26, 09:00 AM', completed: true },
        { status: 'Quality Check', date: 'Oct 27, 11:00 AM', completed: false },
        { status: 'Shipped', date: '-', completed: false },
        { status: 'Delivered', date: '-', completed: false },
    ];

    return (
        <div className="container py-10 px-4 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Track Order</h1>
                <p className="text-muted-foreground">Order ID: {params.id}</p>
            </div>

            <Card className="p-8">
                <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative pl-8">
                            <div className={`absolute -left-[9px] top-0 bg-background ${step.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.completed ? <CheckCircle2 className="w-5 h-5 fill-background" /> : <Circle className="w-5 h-5 fill-background" />}
                            </div>
                            <div>
                                <h3 className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.status}</h3>
                                <p className="text-xs text-muted-foreground">{step.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
