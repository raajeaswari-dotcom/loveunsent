"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

interface ReviewSectionProps {
    occasion?: string;
    inkColor?: string;
    recipientName?: string;
    recipientAddress?: string;
    addons?: any[];
    total?: number;
    message?: string;
    paper?: any;
    handwritingImageUrl?: string | null;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
    occasion,
    inkColor,
    recipientName,
    recipientAddress,
    addons,
    total,
    message,
    paper,
    handwritingImageUrl,
}) => {
    return (
        <div className="space-y-6">
            <Card className="p-6 bg-muted/20 border-2">
                <h3 className="font-bold mb-3 text-lg">Your Message</h3>
                {handwritingImageUrl ? (
                    <div className="relative h-64 w-full">
                        <img
                            src={handwritingImageUrl}
                            alt="Uploaded Handwriting"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-foreground/90">
                        {message || 'No message entered...'}
                    </p>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {occasion && (
                    <Card className="p-4">
                        <h4 className="font-semibold mb-2">Occasion</h4>
                        <p>{occasion}</p>
                    </Card>
                )}
                {paper && (
                    <Card className="p-4">
                        <h4 className="font-semibold mb-2">Paper</h4>
                        <p>{paper.name}</p>
                    </Card>
                )}
                {inkColor && (
                    <Card className="p-4">
                        <h4 className="font-semibold mb-2">Ink Color</h4>
                        <p>{inkColor}</p>
                    </Card>
                )}

                {recipientName && (
                    <Card className="p-4">
                        <h4 className="font-semibold mb-2">Recipient</h4>
                        <p>{recipientName}</p>
                        <p className="text-sm text-muted-foreground">{recipientAddress}</p>
                    </Card>
                )}
                {addons && addons.length > 0 && (
                    <Card className="p-4 md:col-span-2">
                        <h4 className="font-semibold mb-2">Add-ons</h4>
                        <ul className="list-disc list-inside">
                            {addons.map((addon) => (
                                <li key={addon.id}>{addon.name}</li>
                            ))}
                        </ul>
                    </Card>
                )}
            </div>
            <Card className="p-4 bg-primary/10">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold">Total</h4>
                    <p className="text-2xl font-bold">₹{total}</p>
                </div>
            </Card>
        </div>
    );
};
