"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Package, Truck, Home } from 'lucide-react';

interface TimelineEvent {
    status: string;
    timestamp: string;
    description: string;
    completed: boolean;
}

interface OrderTimelineProps {
    workflowState: string;
    createdAt: string;
    updatedAt: string;
}

const WORKFLOW_TIMELINE = [
    { status: 'pending_payment', label: 'Payment Pending', icon: Clock },
    { status: 'paid', label: 'Payment Received', icon: CheckCircle2 },
    { status: 'assigned', label: 'Writer Assigned', icon: Package },
    { status: 'writing_in_progress', label: 'Writing in Progress', icon: Package },
    { status: 'draft_uploaded', label: 'Draft Uploaded', icon: Package },
    { status: 'qc_review', label: 'QC Review', icon: Package },
    { status: 'approved', label: 'QC Approved', icon: CheckCircle2 },
    { status: 'packed', label: 'Order Packed', icon: Package },
    { status: 'shipped', label: 'Order Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({ workflowState, createdAt, updatedAt }: OrderTimelineProps) {
    const currentIndex = WORKFLOW_TIMELINE.findIndex(item => item.status === workflowState);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {WORKFLOW_TIMELINE.map((item, index) => {
                        const Icon = item.icon;
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={item.status} className="flex items-start gap-4">
                                {/* Timeline Line */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`rounded-full p-2 ${isCompleted
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    {index < WORKFLOW_TIMELINE.length - 1 && (
                                        <div
                                            className={`w-0.5 h-12 ${isCompleted ? 'bg-primary' : 'bg-muted'
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Timeline Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{item.label}</h4>
                                        {isCurrent && (
                                            <Badge variant="default">Current</Badge>
                                        )}
                                    </div>
                                    {isCompleted && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {isCurrent
                                                ? new Date(updatedAt).toLocaleString('en-IN')
                                                : index === 0
                                                    ? new Date(createdAt).toLocaleString('en-IN')
                                                    : 'Completed'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
