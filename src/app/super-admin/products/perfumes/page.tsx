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

interface Perfume {
    _id: string;
    name: string;
    description?: string;
    priceExtra: number;
    imageUrl?: string;
    stock: number;
    isActive: boolean;
}

export default function PerfumesManagementPage() {
    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);
    const [deletingPerfume, setDeletingPerfume] = useState<Perfume | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priceExtra: 0,
        imageUrl: '',
        stock: 0,
    });

    useEffect(() => {
        fetchPerfumes();
    }, []);

    const fetchPerfumes = async () => {
        try {
            const response = await fetch('/api/products/perfume');
            const data = await response.json();
            if (data.success) {
                setPerfumes(data.data.perfumes || []);
            }
        } catch (error) {
            console.error('Error fetching perfumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPerfume(null);
        setFormData({
            name: '',
            description: '',
            priceExtra: 0,
            imageUrl: '',
            stock: 0,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (perfume: Perfume) => {
        setEditingPerfume(perfume);
        setFormData({
            name: perfume.name,
            description: perfume.description || '',
            priceExtra: perfume.priceExtra,
            imageUrl: perfume.imageUrl || '',
            stock: perfume.stock,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingPerfume
                ? `/api/products/perfume/${editingPerfume._id}`
                : '/api/products/perfume';

            const method = editingPerfume ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                await fetchPerfumes();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save perfume');
            }
        } catch (error) {
            console.error('Error saving perfume:', error);
            alert('Failed to save perfume');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingPerfume) return;

        try {
            const response = await fetch(`/api/products/perfume/${deletingPerfume._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchPerfumes();
                setIsDeleteDialogOpen(false);
                setDeletingPerfume(null);
            } else {
                alert(data.message || 'Failed to delete perfume');
            }
        } catch (error) {
            console.error('Error deleting perfume:', error);
            alert('Failed to delete perfume');
        }
    };

    const filteredPerfumes = perfumes.filter(perfume =>
        perfume.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Perfumes Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Perfume
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search perfumes..."
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
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price Extra</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPerfumes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No perfumes found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPerfumes.map((perfume) => (
                                        <TableRow key={perfume._id}>
                                            <TableCell>
                                                {perfume.imageUrl && (
                                                    <img src={perfume.imageUrl} alt={perfume.name} className="h-12 w-12 object-cover rounded" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{perfume.name}</TableCell>
                                            <TableCell>₹{perfume.priceExtra}</TableCell>
                                            <TableCell>{perfume.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={perfume.isActive ? 'default' : 'secondary'}>
                                                    {perfume.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(perfume)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingPerfume(perfume);
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
                        <DialogTitle>{editingPerfume ? 'Edit Perfume' : 'Create Perfume'}</DialogTitle>
                        <DialogDescription>
                            {editingPerfume ? 'Update perfume details' : 'Add a new perfume'}
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
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priceExtra">Price Extra (₹)</Label>
                                <Input
                                    id="priceExtra"
                                    type="number"
                                    value={formData.priceExtra}
                                    onChange={(e) => setFormData({ ...formData, priceExtra: Number(e.target.value) })}
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
                            label="Perfume Image (Optional)"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingPerfume ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingPerfume?.name}
            />
        </div>
    );
}
