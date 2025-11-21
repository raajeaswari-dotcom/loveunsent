"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import OrderCard from '@/components/customer/OrderCard';
import OrderFilters from '@/components/customer/OrderFilters';
import { ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        fetchOrders();
    }, [searchTerm, statusFilter, dateRange, currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: ordersPerPage.toString(),
            });

            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') {
                // Map customer-friendly filters to backend statuses
                if (statusFilter === 'in_progress') {
                    params.append('status', 'writer_assigned,writing_in_progress,draft_uploaded,qc_review,qc_approved,order_packed');
                } else if (statusFilter === 'shipped') {
                    params.append('status', 'order_shipped');
                } else {
                    params.append('status', statusFilter);
                }
            }
            if (dateRange !== 'all') {
                const days = parseInt(dateRange);
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                params.append('startDate', startDate.toISOString());
                params.append('endDate', endDate.toISOString());
            }

            const response = await fetch(`/api/orders/list?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders || []);
            if (data.pagination) {
                setTotalPages(data.pagination.pages);
            } else {
                setTotalPages(1);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Unable to load orders. Please try again later.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel order');
            }

            // Refresh orders
            fetchOrders();
            alert('Order cancelled successfully');
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert('Failed to cancel order. Please try again or contact support.');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateRange('all');
        setCurrentPage(1);
    };

    return (
        <div className="container py-10 px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">My Orders</h1>
                <p className="text-muted-foreground">
                    Track and manage all your handwritten letter orders
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <OrderFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onReset={handleResetFilters}
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-20">
                    <div className="bg-red-50 text-red-800 p-4 rounded-lg inline-block">
                        <p className="font-medium">{error}</p>
                        <Button
                            onClick={fetchOrders}
                            variant="outline"
                            className="mt-4"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                        {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                            ? 'No orders found'
                            : 'No orders yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start creating your first heartfelt handwritten letter'}
                    </p>
                    {searchTerm || statusFilter !== 'all' || dateRange !== 'all' ? (
                        <Button onClick={handleResetFilters} variant="outline">
                            Clear Filters
                        </Button>
                    ) : (
                        <Button asChild>
                            <Link href="/customize">Create Your First Letter</Link>
                        </Button>
                    )}
                </div>
            )}

            {/* Orders List */}
            {!loading && !error && orders.length > 0 && (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onCancel={handleCancelOrder}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
