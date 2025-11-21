"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, ZoomIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QCTaskDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    const handleAction = (action: 'approve' | 'reject') => {
        setProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            router.push('/qc/tasks');
        }, 1000);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Reviewing {params.id}</h1>
                <div className="flex gap-3">
                    <Button
                        variant="destructive"
                        onClick={() => handleAction('reject')}
                        disabled={processing}
                    >
                        <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction('approve')}
                        disabled={processing}
                    >
                        <Check className="w-4 h-4 mr-2" /> Approve
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Image Viewer */}
                <div className="lg:col-span-2 bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-zinc-500 flex flex-col items-center gap-2">
                        <ZoomIn className="w-8 h-8" />
                        <p>High-Res Scan Preview</p>
                    </div>
                    {/* In a real app, this would be an interactive image viewer */}
                </div>

                {/* Order Details Sidebar */}
                <div className="space-y-6 overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <span className="font-bold block text-muted-foreground">Writer</span>
                                <span>Sarah Writer</span>
                            </div>
                            <div>
                                <span className="font-bold block text-muted-foreground">Paper</span>
                                <span>Vintage Parchment</span>
                            </div>
                            <div>
                                <span className="font-bold block text-muted-foreground">Style</span>
                                <span>Classic Cursive</span>
                            </div>
                            <div>
                                <span className="font-bold block text-muted-foreground">Special Instructions</span>
                                <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Extra spacing between paragraphs</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Original Text</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted/30 rounded text-sm font-serif whitespace-pre-wrap border">
                                {`My Dearest Elena,

I hope this letter finds you well...`}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
