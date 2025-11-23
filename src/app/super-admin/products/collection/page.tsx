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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductImageUpload } from '@/components/admin/ProductImageUpload';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2, Database } from 'lucide-react';
import { getCloudinaryUrl } from '@/lib/cloudinaryClient';

interface CollectionItem {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    imageUrl: string;
    category: 'stationery' | 'gift' | 'accessory' | 'other';
    stock: number;
    isActive: boolean;
}

export default function CollectionManagementPage() {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
    const [deletingCollection, setDeletingCollection] = useState<CollectionItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'other' as 'stationery' | 'gift' | 'accessory' | 'other',
        stock: 0,
    });

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/products/collection/list');
            const data = await response.json();
            if (data.success) {
                setCollections(data.data.collections || []);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCollection(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            price: 0,
            imageUrl: '',
            category: 'other',
            stock: 0,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (collection: CollectionItem) => {
        setEditingCollection(collection);
        setFormData({
            name: collection.name,
            slug: collection.slug,
            description: collection.description || '',
            price: collection.price,
            imageUrl: collection.imageUrl,
            category: collection.category,
            stock: collection.stock,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingCollection
                ? `/api/products/collection/${editingCollection._id}`
                : '/api/products/collection/create';

            const method = editingCollection ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                await fetchCollections();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save collection item');
            }
        } catch (error) {
            console.error('Error saving collection item:', error);
            alert('Failed to save collection item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCollection) return;

        try {
            const response = await fetch(`/api/products/collection/${deletingCollection._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchCollections();
                setIsDeleteDialogOpen(false);
                setDeletingCollection(null);
            } else {
                alert(data.message || 'Failed to delete collection item');
            }
        } catch (error) {
            console.error('Error deleting collection item:', error);
            alert('Failed to delete collection item');
        }
    };

    const handleSeedData = async () => {
        if (!confirm('This will add 10 sample products to the collection. Continue?')) return;

        setSeeding(true);
        try {
            const response = await fetch('/api/products/collection/seed', {
                method: 'POST',
            });

            const data = await response.json();
            if (data.success) {
                alert(data.data.message);
                await fetchCollections();
            } else {
                alert(data.message || 'Failed to seed sample products');
            }
        } catch (error) {
            console.error('Error seeding sample products:', error);
            alert('Failed to seed sample products');
        } finally {
            setSeeding(false);
        }
    };

    const filteredCollections = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Our Collection</h1>
                <div className="flex gap-2">
                    <Button onClick={handleSeedData} variant="outline" disabled={seeding}>
                        {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                        Add Sample Products
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search collection items..."
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
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCollections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No collection items found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCollections.map((collection) => (
                                        <TableRow key={collection._id}>
                                            <TableCell>
                                                <img src={getCloudinaryUrl(collection.imageUrl)} alt={collection.name} className="h-12 w-12 object-cover rounded" />
                                            </TableCell>
                                            <TableCell className="font-medium">{collection.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{collection.category}</Badge>
                                            </TableCell>
                                            <TableCell>₹{collection.price}</TableCell>
                                            <TableCell>{collection.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                                                    {collection.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(collection)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingCollection(collection);
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
                        <DialogTitle>{editingCollection ? 'Edit Collection Item' : 'Create Collection Item'}</DialogTitle>
                        <DialogDescription>
                            {editingCollection ? 'Update collection item details' : 'Add a new item to the collection'}
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
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
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

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stationery">Stationery</SelectItem>
                                    <SelectItem value="gift">Gift</SelectItem>
                                    <SelectItem value="accessory">Accessory</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.slug || !formData.imageUrl}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingCollection ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingCollection?.name}
            />
        </div>
    );
}
