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
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2, Receipt } from 'lucide-react';

interface TaxConfig {
    _id: string;
    taxType: string;
    taxName: string;
    taxRate: number;
    applicableStates: string[];
    hsnCode?: string;
    description?: string;
    effectiveFrom: string;
    effectiveTo?: string;
    isActive: boolean;
}

const TAX_TYPES = ['GST', 'IGST', 'CGST', 'SGST', 'CUSTOM'];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function TaxManagementPage() {
    const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<TaxConfig | null>(null);
    const [deletingConfig, setDeletingConfig] = useState<TaxConfig | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        taxType: 'GST',
        taxName: '',
        taxRate: 18,
        applicableStates: [] as string[],
        hsnCode: '',
        description: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
    });

    const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchTaxConfigs();
    }, []);

    const fetchTaxConfigs = async () => {
        try {
            const response = await fetch('/api/admin/tax');
            const data = await response.json();
            if (data.success) {
                setTaxConfigs(data.data.taxConfigs || []);
            }
        } catch (error) {
            console.error('Error fetching tax configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingConfig(null);
        setFormData({
            taxType: 'GST',
            taxName: '',
            taxRate: 18,
            applicableStates: [],
            hsnCode: '',
            description: '',
            effectiveFrom: new Date().toISOString().split('T')[0],
            effectiveTo: '',
        });
        setSelectedStates(new Set());
        setIsDialogOpen(true);
    };

    const handleEdit = (config: TaxConfig) => {
        setEditingConfig(config);
        setFormData({
            taxType: config.taxType,
            taxName: config.taxName,
            taxRate: config.taxRate,
            applicableStates: config.applicableStates,
            hsnCode: config.hsnCode || '',
            description: config.description || '',
            effectiveFrom: config.effectiveFrom.split('T')[0],
            effectiveTo: config.effectiveTo ? config.effectiveTo.split('T')[0] : '',
        });
        setSelectedStates(new Set(config.applicableStates));
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingConfig
                ? `/api/admin/tax/${editingConfig._id}`
                : '/api/admin/tax';

            const method = editingConfig ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                applicableStates: Array.from(selectedStates),
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                await fetchTaxConfigs();
                setIsDialogOpen(false);
            } else {
                alert(data.message || 'Failed to save tax config');
            }
        } catch (error) {
            console.error('Error saving tax config:', error);
            alert('Failed to save tax config');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingConfig) return;

        try {
            const response = await fetch(`/api/admin/tax/${deletingConfig._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchTaxConfigs();
                setIsDeleteDialogOpen(false);
                setDeletingConfig(null);
            } else {
                alert(data.message || 'Failed to delete tax config');
            }
        } catch (error) {
            console.error('Error deleting tax config:', error);
            alert('Failed to delete tax config');
        }
    };

    const toggleState = (state: string) => {
        const newStates = new Set(selectedStates);
        if (newStates.has(state)) {
            newStates.delete(state);
        } else {
            newStates.add(state);
        }
        setSelectedStates(newStates);
    };

    const selectAllStates = () => {
        setSelectedStates(new Set(INDIAN_STATES));
    };

    const clearAllStates = () => {
        setSelectedStates(new Set());
    };

    const filteredConfigs = taxConfigs.filter(config =>
        config.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.taxType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tax Configuration</h1>
                    <p className="text-muted-foreground mt-1">Manage GST and tax rates</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tax Config
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tax configs..."
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
                                    <TableHead>Tax Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>HSN Code</TableHead>
                                    <TableHead>States</TableHead>
                                    <TableHead>Effective</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredConfigs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                            No tax configurations found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredConfigs.map((config) => (
                                        <TableRow key={config._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{config.taxName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{config.taxType}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{config.taxRate}%</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {config.hsnCode || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {config.applicableStates.length > 0
                                                        ? `${config.applicableStates.length} states`
                                                        : 'All India'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(config.effectiveFrom)}
                                                {config.effectiveTo && ` - ${formatDate(config.effectiveTo)}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={config.isActive ? 'default' : 'secondary'}>
                                                    {config.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(config)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeletingConfig(config);
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
                        <DialogTitle>{editingConfig ? 'Edit Tax Config' : 'Create Tax Config'}</DialogTitle>
                        <DialogDescription>
                            {editingConfig ? 'Update tax configuration' : 'Add a new tax configuration'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="taxName">Tax Name *</Label>
                                <Input
                                    id="taxName"
                                    value={formData.taxName}
                                    onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                                    placeholder="e.g., Standard GST"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="taxType">Tax Type *</Label>
                                <Select
                                    value={formData.taxType}
                                    onValueChange={(value) => setFormData({ ...formData, taxType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TAX_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="taxRate">Tax Rate (%) *</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="hsnCode">HSN Code</Label>
                                <Input
                                    id="hsnCode"
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                    placeholder="e.g., 4901"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="effectiveFrom">Effective From *</Label>
                                <Input
                                    id="effectiveFrom"
                                    type="date"
                                    value={formData.effectiveFrom}
                                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="effectiveTo">Effective To</Label>
                                <Input
                                    id="effectiveTo"
                                    type="date"
                                    value={formData.effectiveTo}
                                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Applicable States</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllStates}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllStates}
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
                                                id={`tax-${state}`}
                                                checked={selectedStates.has(state)}
                                                onCheckedChange={() => toggleState(state)}
                                            />
                                            <Label
                                                htmlFor={`tax-${state}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {state}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {selectedStates.size === 0
                                    ? 'No states selected - will apply to all locations'
                                    : `${selectedStates.size} state(s) selected`
                                }
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.taxName || !formData.effectiveFrom}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingConfig ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingConfig?.taxName}
            />
        </div>
    );
}
