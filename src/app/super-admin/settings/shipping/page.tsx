"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2, Truck, Star } from 'lucide-react';

interface ShippingRate {
    _id: string;
    name: string;
    carrier: string;
    description?: string;
    baseRate: number;
    perKmRate?: number;
    deliveryDays: number;
    maxWeight: number;
    zones: string[];
    isActive: boolean;
    isDefault: boolean;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function ShippingManagementPage() {
    const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
    const [deletingRate, setDeletingRate] = useState<ShippingRate | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        carrier: '',
        description: '',
        baseRate: 0,
        perKmRate: 0,
        deliveryDays: 3,
        maxWeight: 500,
        zones: [] as string[],
        isDefault: false,
    });

    const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchShippingRates();
    }, []);

    const fetchShippingRates = async () => {
        try {
            const response = await fetch('/api/admin/shipping');
            const data = await response.json();
            if (data.success) {
                setShippingRates(data.data.shippingRates || []);
            }
        } catch (error) {
            console.error('Error fetching shipping rates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRate(null);
        setFormData({
            name: '',
            carrier: '',
            description: '',
            baseRate: 0,
            perKmRate: 0,
            deliveryDays: 3,
            maxWeight: 500,
            zones: [],
            isDefault: false,
        });
        setSelectedZones(new Set());
        setIsDialogOpen(true);
    };

    const handleEdit = (rate: ShippingRate) => {
        setEditingRate(rate);
        setFormData({
            name: rate.name,
            carrier: rate.carrier,
            description: rate.description || '',
            baseRate: rate.baseRate,
            perKmRate: rate.perKmRate || 0,
            deliveryDays: rate.deliveryDays,
            maxWeight: rate.maxWeight,
            zones: rate.zones,
            isDefault: rate.isDefault,
        });
        setSelectedZones(new Set(rate.zones));
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingRate
                ? `/api/admin/shipping/${editingRate._id}`
                : '/api/admin/shipping';

            const method = editingRate ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                zones: Array.from(selectedZones),
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                await fetchShippingRates();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save shipping rate');
            }
        } catch (error) {
            console.error('Error saving shipping rate:', error);
            alert('Failed to save shipping rate');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingRate) return;

        try {
            const response = await fetch(`/api/admin/shipping/${deletingRate._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchShippingRates();
                setIsDeleteDialogOpen(false);
                setDeletingRate(null);
            } else {
                alert(data.message || 'Failed to delete shipping rate');
            }
        } catch (error) {
            console.error('Error deleting shipping rate:', error);
            alert('Failed to delete shipping rate');
        }
    };

    const toggleZone = (zone: string) => {
        const newZones = new Set(selectedZones);
        if (newZones.has(zone)) {
            newZones.delete(zone);
        } else {
            newZones.add(zone);
        }
        setSelectedZones(newZones);
    };

    const selectAllZones = () => {
        setSelectedZones(new Set(INDIAN_STATES));
    };

    const clearAllZones = () => {
        setSelectedZones(new Set());
    };

    const filteredRates = shippingRates.filter(rate =>
        rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shipping Configuration</h1>
                    <p className="text-muted-foreground mt-1">Manage shipping rates and courier partners</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shipping Rate
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search shipping rates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Carrier</TableHead>
                                    <TableHead>Base Rate</TableHead>
                                    <TableHead>Delivery</TableHead>
                                    <TableHead>Zones</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No shipping rates found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRates.map((rate) => (
                                        <TableRow key={rate._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{rate.name}</span>
                                                    {rate.isDefault && (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{rate.carrier}</TableCell>
                                            <TableCell>₹{rate.baseRate}</TableCell>
                                            <TableCell>{rate.deliveryDays} days</TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {rate.zones.length > 0 ? `${rate.zones.length} zones` : 'All India'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                                                    {rate.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(rate)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingRate(rate);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRate ? 'Edit Shipping Rate' : 'Create Shipping Rate'}</DialogTitle>
                        <DialogDescription>
                            {editingRate ? 'Update shipping rate details' : 'Add a new shipping rate'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Standard Shipping"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="carrier">Carrier *</Label>
                                <Input
                                    id="carrier"
                                    value={formData.carrier}
                                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                                    placeholder="e.g., BlueDart"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="baseRate">Base Rate (₹) *</Label>
                                <Input
                                    id="baseRate"
                                    type="number"
                                    value={formData.baseRate}
                                    onChange={(e) => setFormData({ ...formData, baseRate: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="deliveryDays">Delivery Days *</Label>
                                <Input
                                    id="deliveryDays"
                                    type="number"
                                    value={formData.deliveryDays}
                                    onChange={(e) => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="maxWeight">Max Weight (g)</Label>
                                <Input
                                    id="maxWeight"
                                    type="number"
                                    value={formData.maxWeight}
                                    onChange={(e) => setFormData({ ...formData, maxWeight: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isDefault: checked as boolean })
                                }
                            />
                            <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                                Set as default shipping method
                            </Label>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Applicable Zones/States</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllZones}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllZones}
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                            <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-3 gap-2">
                                    {INDIAN_STATES.map((state) => (
                                        <div key={state} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={state}
                                                checked={selectedZones.has(state)}
                                                onCheckedChange={() => toggleZone(state)}
                                            />
                                            <Label
                                                htmlFor={state}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {state}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {selectedZones.size === 0
                                    ? 'No zones selected - will apply to all locations'
                                    : `${selectedZones.size} zone(s) selected`
                                }
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.carrier}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingRate ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingRate?.name}
            />
        </div>
    );
}
