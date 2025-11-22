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

interface Paper {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    priceExtra: number;
    imageUrl: string;
    gsm?: number;
    texture?: string;
    stock: number;
    isActive: boolean;
}

export default function PapersManagementPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
    const [deletingPaper, setDeletingPaper] = useState<Paper | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        priceExtra: 0,
        imageUrl: '',
        gsm: 0,
        texture: '',
        stock: 0,
    });

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const response = await fetch('/api/products/paper/list');
            const data = await response.json();
            if (data.success) {
                setPapers(data.data.papers || []);
            }
        } catch (error) {
            console.error('Error fetching papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPaper(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            priceExtra: 0,
            imageUrl: '',
            gsm: 0,
            texture: '',
            stock: 0,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (paper: Paper) => {
        setEditingPaper(paper);
        setFormData({
            name: paper.name,
            slug: paper.slug,
            description: paper.description || '',
            priceExtra: paper.priceExtra,
            imageUrl: paper.imageUrl,
            gsm: paper.gsm || 0,
            texture: paper.texture || '',
            stock: paper.stock,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingPaper
                ? `/api/products/paper/${editingPaper._id}`
                : '/api/products/paper/create';

            const method = editingPaper ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                await fetchPapers();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save paper');
            }
        } catch (error) {
            console.error('Error saving paper:', error);
            alert('Failed to save paper');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingPaper) return;

        try {
            const response = await fetch(`/api/products/paper/${deletingPaper._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchPapers();
                setIsDeleteDialogOpen(false);
                setDeletingPaper(null);
            } else {
                alert(data.message || 'Failed to delete paper');
            }
        } catch (error) {
            console.error('Error deleting paper:', error);
            alert('Failed to delete paper');
        }
    };

    const filteredPapers = papers.filter(paper =>
        paper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Papers Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Paper
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search papers..."
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
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Price Extra</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPapers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No papers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPapers.map((paper) => (
                                        <TableRow key={paper._id}>
                                            <TableCell>
                                                <img src={getCloudinaryUrl(paper.imageUrl)} alt={paper.name} className="h-12 w-12 object-cover rounded" />
                                            </TableCell>
                                            <TableCell className="font-medium">{paper.name}</TableCell>
                                            <TableCell>{paper.slug}</TableCell>
                                            <TableCell>₹{paper.priceExtra}</TableCell>
                                            <TableCell>{paper.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={paper.isActive ? 'default' : 'secondary'}>
                                                    {paper.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(paper)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingPaper(paper);
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
                        <DialogTitle>{editingPaper ? 'Edit Paper' : 'Create Paper'}</DialogTitle>
                        <DialogDescription>
                            {editingPaper ? 'Update paper details' : 'Add a new paper type'}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="gsm">GSM</Label>
                                <Input
                                    id="gsm"
                                    type="number"
                                    value={formData.gsm}
                                    onChange={(e) => setFormData({ ...formData, gsm: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="texture">Texture</Label>
                                <Input
                                    id="texture"
                                    value={formData.texture}
                                    onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
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
                            {editingPaper ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingPaper?.name}
            />
        </div>
    );
}
