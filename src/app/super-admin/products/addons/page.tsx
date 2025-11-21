"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { ProductImageUpload } from '@/components/admin/ProductImageUpload';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Addon {
    _id: string;
    name: string;
    type: 'photo' | 'gift' | 'packaging';
    description?: string;
    price: number;
    imageUrl: string;
    stock: number;
    isActive: boolean;
}

export default function AddonsManagementPage() {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
    const [deletingAddon, setDeletingAddon] = useState<Addon | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'photo' as 'photo' | 'gift' | 'packaging',
        description: '',
        price: 0,
        imageUrl: '',
        stock: 0,
    });

    useEffect(() => {
        fetchAddons();
    }, []);

    const fetchAddons = async () => {
        try {
            const response = await fetch('/api/products/addons');
            const data = await response.json();
            if (data.success) {
                setAddons(data.data.addons || []);
            }
        } catch (error) {
            console.error('Error fetching addons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAddon(null);
        setFormData({
            name: '',
            type: 'photo',
            description: '',
            price: 0,
            imageUrl: '',
            stock: 0,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (addon: Addon) => {
        setEditingAddon(addon);
        setFormData({
            name: addon.name,
            type: addon.type,
            description: addon.description || '',
            price: addon.price,
            imageUrl: addon.imageUrl,
            stock: addon.stock,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingAddon
                ? `/api/products/addons/${editingAddon._id}`
                : '/api/products/addons';

            const method = editingAddon ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                await fetchAddons();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save addon');
            }
        } catch (error) {
            console.error('Error saving addon:', error);
            alert('Failed to save addon');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingAddon) return;

        try {
            const response = await fetch(`/api/products/addons/${deletingAddon._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchAddons();
                setIsDeleteDialogOpen(false);
                setDeletingAddon(null);
            } else {
                alert(data.message || 'Failed to delete addon');
            }
        } catch (error) {
            console.error('Error deleting addon:', error);
            alert('Failed to delete addon');
        }
    };

    const filteredAddons = addons.filter(addon => {
        const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || addon.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add-ons Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Add-on
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search add-ons..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="photo">Photo</SelectItem>
                                <SelectItem value="gift">Gift</SelectItem>
                                <SelectItem value="packaging">Packaging</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAddons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No add-ons found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAddons.map((addon) => (
                                        <TableRow key={addon._id}>
                                            <TableCell>
                                                <img src={addon.imageUrl} alt={addon.name} className="h-12 w-12 object-cover rounded" />
                                            </TableCell>
                                            <TableCell className="font-medium">{addon.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{addon.type}</Badge>
                                            </TableCell>
                                            <TableCell>₹{addon.price}</TableCell>
                                            <TableCell>{addon.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={addon.isActive ? 'default' : 'secondary'}>
                                                    {addon.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(addon)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingAddon(addon);
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAddon ? 'Edit Add-on' : 'Create Add-on'}</DialogTitle>
                        <DialogDescription>
                            {editingAddon ? 'Update add-on details' : 'Add a new add-on'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'photo' | 'gift' | 'packaging') =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="photo">Photo</SelectItem>
                                    <SelectItem value="gift">Gift</SelectItem>
                                    <SelectItem value="packaging">Packaging</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <ProductImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.imageUrl}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingAddon ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingAddon?.name}
            />
        </div>
    );
}
