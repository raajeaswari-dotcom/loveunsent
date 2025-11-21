"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, FileText, Mic, ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOrderDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    return <OrderDetailsClient id={params.id} />;
}

function OrderDetailsClient({ id }: { id: string }) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/orders/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data.data);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to fetch order details",
                        variant: "destructive",
                    });
                }
                // TODO: fetch writers when API is ready
            } catch (err) {
                console.error(err);
                toast({
                    title: "Error",
                    description: "Unexpected error",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return <div className="p-10 text-center">Order not found.</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Order #{order._id?.substring(0, 8)}
                    </h1>
                    <p className="text-muted-foreground">
                        Placed by {order.customerId?.name} on{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="ml-auto">
                    <Badge
                        variant={order.workflowState === "delivered" ? "default" : "secondary"}
                        className="text-lg px-4 py-1 capitalize"
                    >
                        {order.workflowState.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {order.inputMethod === "text" && <FileText className="w-5 h-5" />}
                                {order.inputMethod === "voice" && <Mic className="w-5 h-5" />}
                                {order.inputMethod === "image" && <ImageIcon className="w-5 h-5" />}
                                Letter Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.inputMethod === "text" && (
                                <div className="p-6 bg-muted/30 rounded-lg font-serif text-lg leading-relaxed whitespace-pre-wrap border">
                                    {order.message}
                                </div>
                            )}
                            {order.inputMethod === "image" && (
                                <div className="space-y-4">
                                    <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-muted/10 min-h-[400px]">
                                        {order.handwritingImageUrl ? (
                                            <img
                                                src={order.handwritingImageUrl}
                                                alt="Handwriting Source"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                                                No image uploaded
                                            </div>
                                        )}
                                    </div>
                                    {order.handwritingImageUrl && (
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={order.handwritingImageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" /> Open Original
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Paper</span>
                                <span className="font-medium">{order.paperId?.name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Style</span>
                                <span className="font-medium">{order.handwritingStyleId?.name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Perfume</span>
                                <span className="font-medium">{order.perfumeId?.name || "None"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-bold">₹{order.price}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full">
                                Download Invoice
                            </Button>
                            <Button variant="destructive" className="w-full">
                                Cancel Order
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
