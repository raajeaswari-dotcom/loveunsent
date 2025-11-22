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
import { getCloudinaryUrl } from '@/lib/cloudinaryClient';

interface Occasion {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    imageUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export default function OccasionsManagementPage() {
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
    const [deletingOccasion, setDeletingOccasion] = useState<Occasion | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        description: '',
        imageUrl: '',
        displayOrder: 0,
    });

    useEffect(() => {
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        try {
            const response = await fetch('/api/products/occasions');
            const data = await response.json();
            if (data.success) {
                setOccasions(data.data.occasions || []);
            }
        } catch (error) {
            console.error('Error fetching occasions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleCreate = () => {
        setEditingOccasion(null);
        setFormData({
            name: '',
            slug: '',
            icon: '',
            description: '',
            imageUrl: '',
            displayOrder: occasions.length,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (occasion: Occasion) => {
        setEditingOccasion(occasion);
        setFormData({
            name: occasion.name,
            slug: occasion.slug,
            icon: occasion.icon || '',
            description: occasion.description || '',
            imageUrl: occasion.imageUrl || '',
            displayOrder: occasion.displayOrder,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingOccasion
                ? `/api/products/occasions/${editingOccasion._id}`
                : '/api/products/occasions';

            const method = editingOccasion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                await fetchOccasions();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save occasion');
            }
        } catch (error) {
            console.error('Error saving occasion:', error);
            alert('Failed to save occasion');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingOccasion) return;

        try {
            const response = await fetch(`/api/products/occasions/${deletingOccasion._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchOccasions();
                setIsDeleteDialogOpen(false);
                setDeletingOccasion(null);
            } else {
                alert(data.message || 'Failed to delete occasion');
            }
        } catch (error) {
            console.error('Error deleting occasion:', error);
            alert('Failed to delete occasion');
        }
    };

    const filteredOccasions = occasions.filter(occasion =>
        occasion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occasion.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Occasions Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Occasion
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search occasions..."
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
                                    <TableHead>Order</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOccasions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No occasions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOccasions.map((occasion) => (
                                        <TableRow key={occasion._id}>
                                            <TableCell className="font-medium">{occasion.displayOrder}</TableCell>
                                            <TableCell>
                                                {occasion.imageUrl && (
                                                    <img src={getCloudinaryUrl(occasion.imageUrl)} alt={occasion.name} className="h-12 w-12 object-cover rounded" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-2xl">{occasion.icon}</TableCell>
                                            <TableCell className="font-medium">{occasion.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{occasion.slug}</TableCell>
                                            <TableCell>
                                                <Badge variant={occasion.isActive ? 'default' : 'secondary'}>
                                                    {occasion.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(occasion)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingOccasion(occasion);
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
                        <DialogTitle>{editingOccasion ? 'Edit Occasion' : 'Create Occasion'}</DialogTitle>
                        <DialogDescription>
                            {editingOccasion ? 'Update occasion details' : 'Add a new occasion category'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setFormData({
                                        ...formData,
                                        name,
                                        slug: formData.slug || generateSlug(name)
                                    });
                                }}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                                placeholder="auto-generated from name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="icon">Icon (Emoji)</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="💌"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="displayOrder">Display Order</Label>
                                <Input
                                    id="displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <ProductImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            label="Occasion Image (Optional)"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.slug}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingOccasion ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingOccasion?.name}
            />
        </div>
    );
}
