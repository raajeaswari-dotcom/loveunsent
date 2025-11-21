"use client";

import React from 'react';
import { CheckCircle2, Circle, Package, Truck, Home } from 'lucide-react';

interface OrderTimelineProps {
    currentStatus: string;
    statusHistory?: Array<{
        status: string;
        timestamp: string;
    }>;
}

const CUSTOMER_WORKFLOW_STAGES = [
    { key: 'payment_pending', label: 'Order Placed', icon: Circle },
    { key: 'payment_completed', label: 'Payment Confirmed', icon: CheckCircle2 },
    { key: 'in_progress', label: 'Being Prepared', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
];

// Map backend status to customer-friendly stages
const STATUS_TO_STAGE: Record<string, number> = {
    'payment_pending': 0,
    'payment_completed': 1,
    'writer_assigned': 2,
    'writing_in_progress': 2,
    'draft_uploaded': 2,
    'qc_review': 2,
    'qc_approved': 2,
    'order_packed': 2,
    'order_shipped': 3,
    'delivered': 4,
};

export default function OrderTimeline({ currentStatus, statusHistory }: OrderTimelineProps) {
    const currentStageIndex = STATUS_TO_STAGE[currentStatus] ?? 0;

    const getStageDate = (stageKey: string) => {
        if (!statusHistory) return null;
        const history = statusHistory.find(h => h.status === stageKey);
        return history?.timestamp;
    };

    return (
        <div className="space-y-4">
            {CUSTOMER_WORKFLOW_STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isPending = index > currentStageIndex;
                const Icon = stage.icon;
                const stageDate = getStageDate(stage.key);

                return (
                    <div key={stage.key} className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : isCurrent
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : 'bg-gray-100 border-gray-300 text-gray-400'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p
                                    className={`font-medium ${isCompleted || isCurrent
                                            ? 'text-gray-900'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    {stage.label}
                                    {isCurrent && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            Current
                                        </span>
                                    )}
                                </p>
                                {stageDate && (
                                    <p className="text-xs text-gray-500">
                                        {new Date(stageDate).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
                            </div>
                            {isCurrent && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {stage.key === 'payment_pending' && 'Please complete payment to proceed'}
                                    {stage.key === 'payment_completed' && 'Your order is being processed'}
                                    {stage.key === 'in_progress' && 'Your letter is being handwritten with care'}
                                    {stage.key === 'shipped' && 'Your order is on its way'}
                                    {stage.key === 'delivered' && 'Order completed'}
                                </p>
                            )}
                        </div>

                        {/* Connector Line */}
                        {index < CUSTOMER_WORKFLOW_STAGES.length - 1 && (
                            <div className="absolute left-4 mt-10 w-0.5 h-8 bg-gray-200" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
