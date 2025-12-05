"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface WorkflowManagerProps {
    orderId: string;
    currentStatus: string;
    onUpdate: () => void;
}

interface Writer {
    _id: string;
    name: string;
    email: string;
}

const WORKFLOW_STEPS = [
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'assigned', label: 'Writer Assigned' },
    { value: 'writing_in_progress', label: 'Writing In Progress' },
    { value: 'draft_uploaded', label: 'Draft Uploaded' },
    { value: 'qc_review', label: 'QC Review' },
    { value: 'changes_requested', label: 'Changes Requested' },
    { value: 'approved', label: 'QC Approved' },
    { value: 'packed', label: 'Order Packed' },
    { value: 'shipped', label: 'Order Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function WorkflowManager({ orderId, currentStatus, onUpdate }: WorkflowManagerProps) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Writer Assignment State
    const [writers, setWriters] = useState<Writer[]>([]);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedWriterId, setSelectedWriterId] = useState('');

    useEffect(() => {
        fetchWriters();
    }, []);

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    const fetchWriters = async () => {
        try {
            const response = await fetch('/api/writers/list');
            const data = await response.json();
            if (data.success) {
                setWriters(data.data.writers || []);
            }
        } catch (error) {
            console.error('Error fetching writers:', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === 'assigned') {
            setIsAssignDialogOpen(true);
            return;
        }

        if (!confirm(`Are you sure you want to change status to ${newStatus.replace(/_/g, ' ')}?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Status Updated",
                    description: `Order status changed to ${newStatus.replace(/_/g, ' ')}`,
                });
                setStatus(newStatus);
                onUpdate();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update status",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignWriter = async () => {
        if (!selectedWriterId) {
            toast({ title: "Error", description: "Please select a writer", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/admin/orders/reassign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    writerId: selectedWriterId,
                    reason: 'Super Admin Assignment'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Writer Assigned",
                    description: "Order status updated to Assigned",
                });
                setIsAssignDialogOpen(false);
                onUpdate();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to assign writer",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error assigning writer:', error);
            toast({
                title: "Error",
                description: "Failed to assign writer",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Workflow Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Current Status</Label>
                    <Select
                        value={status}
                        onValueChange={handleStatusChange}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {WORKFLOW_STEPS.map((step) => (
                                <SelectItem key={step.value} value={step.value}>
                                    {step.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Helper Buttons for Common Transitions */}
                <div className="grid grid-cols-2 gap-2">
                    {status === 'paid' && (
                        <Button
                            className="col-span-2"
                            onClick={() => setIsAssignDialogOpen(true)}
                            disabled={loading}
                        >
                            Assign Writer
                        </Button>
                    )}
                    {status === 'assigned' && (
                        <Button
                            className="col-span-2"
                            onClick={() => handleStatusChange('writing_in_progress')}
                            disabled={loading}
                        >
                            Start Writing
                        </Button>
                    )}
                    {status === 'writing_in_progress' && (
                        <Button
                            className="col-span-2"
                            onClick={() => handleStatusChange('draft_uploaded')}
                            disabled={loading}
                        >
                            Upload Draft
                        </Button>
                    )}
                    {status === 'draft_uploaded' && (
                        <Button
                            className="col-span-2"
                            onClick={() => handleStatusChange('qc_review')}
                            disabled={loading}
                        >
                            Send for QC
                        </Button>
                    )}
                    {status === 'qc_review' && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={() => handleStatusChange('changes_requested')}
                                disabled={loading}
                            >
                                Request Changes
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusChange('approved')}
                                disabled={loading}
                            >
                                Approve
                            </Button>
                        </>
                    )}
                    {status === 'approved' && (
                        <Button
                            className="col-span-2"
                            onClick={() => handleStatusChange('packed')}
                            disabled={loading}
                        >
                            Mark Packed
                        </Button>
                    )}
                    {status === 'packed' && (
                        <Button
                            className="col-span-2"
                            onClick={() => handleStatusChange('shipped')}
                            disabled={loading}
                        >
                            Mark Shipped
                        </Button>
                    )}
                    {status === 'shipped' && (
                        <Button
                            className="col-span-2"
                            onClick={() => handleStatusChange('delivered')}
                            disabled={loading}
                        >
                            Mark Delivered
                        </Button>
                    )}
                </div>

                {/* Assign Writer Dialog */}
                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Writer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Writer</Label>
                                <Select value={selectedWriterId} onValueChange={setSelectedWriterId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a writer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {writers.map((writer) => (
                                            <SelectItem key={writer._id} value={writer._id}>
                                                {writer.name} ({writer.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssignWriter} disabled={loading || !selectedWriterId}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Assign
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
