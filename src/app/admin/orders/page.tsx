"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Search, Filter, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminOrderListPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (search) params.append('search', search);

            const response = await fetch(`/api/admin/orders/list?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data.data.orders);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch orders.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [filter, search]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">Manage and track all customer orders.</p>
                </div>
                {/* <Button>Create New Order</Button> */}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilter('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'pending_payment' ? 'default' : 'outline'}
                                onClick={() => setFilter('pending_payment')}
                                size="sm"
                            >
                                Pending
                            </Button>
                            <Button
                                variant={filter === 'assigned' ? 'default' : 'outline'}
                                onClick={() => setFilter('assigned')}
                                size="sm"
                            >
                                Assigned
                            </Button>
                            <Button
                                variant={filter === 'delivered' ? 'default' : 'outline'}
                                onClick={() => setFilter('delivered')}
                                size="sm"
                            >
                                Completed
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Writer</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            <div className="flex justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id} className="border-t hover:bg-muted/5 transition-colors">
                                            <td className="p-4 font-medium">{order._id.substring(0, 8)}...</td>
                                            <td className="p-4">
                                                <div className="font-medium">{order.customerId?.name || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">{order.customerId?.email}</div>
                                            </td>
                                            <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <Badge variant={
                                                    order.workflowState === 'delivered' ? 'default' :
                                                        order.workflowState === 'assigned' ? 'secondary' : 'outline'
                                                } className="capitalize">
                                                    {order.workflowState.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {order.writerId?.name || '-'}
                                            </td>
                                            <td className="p-4">₹{order.price}</td>
                                            <td className="p-4 text-right">
                                                <Link href={`/admin/orders/${order._id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4 mr-2" /> View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
