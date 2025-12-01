"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

interface ShippingRate {
    _id: string;
    name: string;
    region: string;
    minWeight: number;
    maxWeight: number;
    price: number;
    isActive: boolean;
}

export default function ShippingRatesPage() {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingRate, setDeletingRate] = useState<ShippingRate | null>(null);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        region: 'India',
        minWeight: 0,
        maxWeight: 1000,
        price: 0
    });

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const response = await fetch('/api/super-admin/settings/shipping');
            if (response.ok) {
                const data = await response.json();
                setRates(data.data.rates);
            }
        } catch (error) {
            console.error('Failed to fetch rates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData({
            name: '',
            region: 'India',
            minWeight: 0,
            maxWeight: 1000,
            price: 0
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/super-admin/settings/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Shipping rate created successfully"
                });
                setIsDialogOpen(false);
                fetchRates();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to create rate",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingRate) return;

        try {
            const response = await fetch(`/api/super-admin/settings/shipping/${deletingRate._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Shipping rate deleted successfully"
                });
                setIsDeleteDialogOpen(false);
                setDeletingRate(null);
                fetchRates();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete rate",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shipping Rates</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage shipping zones and delivery fees.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" /> Add Rate
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Rates</CardTitle>
                    <CardDescription>
                        List of all configured shipping rates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Weight Range (g)</TableHead>
                                <TableHead>Price (₹)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No shipping rates configured
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rates.map((rate) => (
                                    <TableRow key={rate._id}>
                                        <TableCell className="font-medium">{rate.name}</TableCell>
                                        <TableCell>{rate.region}</TableCell>
                                        <TableCell>{rate.minWeight}g - {rate.maxWeight}g</TableCell>
                                        <TableCell>₹{rate.price}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setDeletingRate(rate);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Shipping Rate</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Rate Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Standard Delivery"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="region">Region/Zone</Label>
                            <Input
                                id="region"
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="minWeight">Min Weight (g)</Label>
                                <Input
                                    id="minWeight"
                                    type="number"
                                    value={formData.minWeight}
                                    onChange={(e) => setFormData({ ...formData, minWeight: Number(e.target.value) })}
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
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Rate
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
