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
import { ProductImageUpload } from '@/components/admin/ProductImageUpload';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getCloudinaryUrl } from '@/lib/cloudinaryClient';

interface Handwriting {
    _id: string;
    name: string;
    imageUrl: string;
    priceExtra: number;
    isCursive: boolean;
    isActive: boolean;
}

export default function HandwritingManagementPage() {
    const [handwritings, setHandwritings] = useState<Handwriting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingHandwriting, setEditingHandwriting] = useState<Handwriting | null>(null);
    const [deletingHandwriting, setDeletingHandwriting] = useState<Handwriting | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        imageUrl: '',
        priceExtra: 0,
        isCursiveChecked: true,
    });

    useEffect(() => {
        fetchHandwritings();
    }, []);

    const fetchHandwritings = async () => {
        try {
            const response = await fetch('/api/products/handwriting');
            const data = await response.json();
            if (data.success) {
                setHandwritings(data.data.handwritings || []);
            }
        } catch (error) {
            console.error('Error fetching handwritings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingHandwriting(null);
        setFormData({
            name: '',
            imageUrl: '',
            priceExtra: 0,
            isCursiveChecked: true,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (handwriting: Handwriting) => {
        setEditingHandwriting(handwriting);
        setFormData({
            name: handwriting.name,
            imageUrl: handwriting.imageUrl,
            priceExtra: handwriting.priceExtra,
            isCursiveChecked: handwriting.isCursive,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingHandwriting
                ? `/api/products/handwriting/${editingHandwriting._id}`
                : '/api/products/handwriting';

            const method = editingHandwriting ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                imageUrl: formData.imageUrl,
                priceExtra: formData.priceExtra,
                isCursive: formData.isCursiveChecked,
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                await fetchHandwritings();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save handwriting style');
            }
        } catch (error) {
            console.error('Error saving handwriting:', error);
            alert('Failed to save handwriting style');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingHandwriting) return;

        try {
            const response = await fetch(`/api/products/handwriting/${deletingHandwriting._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchHandwritings();
                setIsDeleteDialogOpen(false);
                setDeletingHandwriting(null);
            } else {
                alert(data.message || 'Failed to delete handwriting style');
            }
        } catch (error) {
            console.error('Error deleting handwriting:', error);
            alert('Failed to delete handwriting style');
        }
    };

    const filteredHandwritings = handwritings.filter(handwriting =>
        handwriting.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Handwriting Styles Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Handwriting Style
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search handwriting styles..."
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
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price Extra</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHandwritings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No handwriting styles found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredHandwritings.map((handwriting) => (
                                        <TableRow key={handwriting._id}>
                                            <TableCell>
                                                <img src={getCloudinaryUrl(handwriting.imageUrl)} alt={handwriting.name} className="h-12 w-20 object-contain rounded border" />
                                            </TableCell>
                                            <TableCell className="font-medium">{handwriting.name}</TableCell>
                                            <TableCell>₹{handwriting.priceExtra}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {handwriting.isCursive ? 'Cursive' : 'Print'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={handwriting.isActive ? 'default' : 'secondary'}>
                                                    {handwriting.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(handwriting)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingHandwriting(handwriting);
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
                        <DialogTitle>{editingHandwriting ? 'Edit Handwriting Style' : 'Create Handwriting Style'}</DialogTitle>
                        <DialogDescription>
                            {editingHandwriting ? 'Update handwriting style details' : 'Add a new handwriting style'}
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
                            <Label htmlFor="priceExtra">Price Extra (₹)</Label>
                            <Input
                                id="priceExtra"
                                type="number"
                                value={formData.priceExtra}
                                onChange={(e) => setFormData({ ...formData, priceExtra: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isCursive"
                                checked={formData.isCursiveChecked}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isCursiveChecked: checked as boolean })
                                }
                            />
                            <Label htmlFor="isCursive" className="text-sm font-normal cursor-pointer">
                                Cursive style
                            </Label>
                        </div>

                        <ProductImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            label="Preview Image *"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.imageUrl}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingHandwriting ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingHandwriting?.name}
            />
        </div>
    );
}
