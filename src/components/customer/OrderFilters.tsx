"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface OrderFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    dateRange: string;
    onDateRangeChange: (value: string) => void;
    onReset: () => void;
}

export default function OrderFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    dateRange,
    onDateRangeChange,
    onReset,
}: OrderFiltersProps) {
    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateRange !== 'all';

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="payment_pending">Payment Pending</SelectItem>
                        <SelectItem value="payment_completed">Paid</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date Range */}
                <Select value={dateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7">Last 7 Days</SelectItem>
                        <SelectItem value="30">Last 30 Days</SelectItem>
                        <SelectItem value="90">Last 3 Months</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button */}
                {hasActiveFilters && (
                    <Button variant="outline" onClick={onReset} className="gap-2">
                        <X className="w-4 h-4" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
