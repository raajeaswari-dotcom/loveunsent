"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Loader2, Package, Clock, CheckCircle2, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    customerId: { name: string; email: string };
    workflowState: string;
    payment: { status: string };
    price: number;
    createdAt: string;
    writerId?: { name: string };
    trackingId?: string;
}

interface QuickStats {
    totalOrders: number;
    pendingPayment: number;
    inProgress: number;
    completedToday: number;
    revenueToday: number;
}

const WORKFLOW_STATES = [
    'all', 'pending_payment', 'paid', 'assigned', 'writing_in_progress',
    'draft_uploaded', 'qc_review', 'changes_requested', 'approved',
    'packed', 'shipped', 'delivered', 'cancelled'
];

const PAYMENT_STATUSES = ['all', 'pending', 'captured', 'failed'];

export default function SuperAdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<QuickStats>({
        totalOrders: 0,
        pendingPayment: 0,
        inProgress: 0,
        completedToday: 0,
        revenueToday: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        paymentStatus: 'all',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchOrders();
    }, [filters, pagination.page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
                ...(filters.search && { search: filters.search }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });

            const response = await fetch(`/api/admin/orders/list?${params}`);
            const data = await response.json();

            if (data.success) {
                setOrders(data.data.orders || []);
                setPagination(data.data.pagination);
                setStats(data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const params = new URLSearchParams({
                format: 'csv',
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });

            const response = await fetch(`/api/admin/orders/export?${params}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders-${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting orders:', error);
            alert('Failed to export orders');
        } finally {
            setExporting(false);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'default';
            case 'pending_payment':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6 max-w-7xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
                <p className="text-muted-foreground mt-1">View and manage all customer orders</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPayment}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Loader2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenueToday)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.completedToday} completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <Label className="text-sm mb-2">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search order ID..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm mb-2">Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters({ ...filters, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {WORKFLOW_STATES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm mb-2">Payment</Label>
                            <Select
                                value={filters.paymentStatus}
                                onValueChange={(value) => setFilters({ ...filters, paymentStatus: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status === 'all' ? 'All Payments' : status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={handleExport} disabled={exporting} variant="outline" className="w-full">
                                {exporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <Label className="text-sm mb-2">Start Date</Label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label className="text-sm mb-2">End Date</Label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Writer</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order._id}>
                                                <TableCell className="font-mono text-sm">
                                                    {order._id.slice(-8)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{order.customerId?.name || 'N/A'}</div>
                                                    <div className="text-sm text-muted-foreground">{order.customerId?.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(order.workflowState)}>
                                                        {order.workflowState.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={order.payment?.status === 'captured' ? 'default' : 'secondary'}>
                                                        {order.payment?.status || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {order.writerId?.name || 'Unassigned'}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(order.price)}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/super-admin/orders/${order._id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                            disabled={pagination.page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                            disabled={pagination.page === pagination.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
