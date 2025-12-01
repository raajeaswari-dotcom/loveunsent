"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'writer' | 'qc' | 'customer';
    isActive: boolean;
    createdAt: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer' as User['role'],
        isActive: true
    });

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/super-admin/users/list', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data.users);
                setFilteredUsers(data.data.users);
                if (data.data.currentUserId) {
                    setCurrentUserId(data.data.currentUserId);
                }
            } else {
                const errorData = await response.json();
                console.error('Fetch users failed:', errorData);
                toast({
                    title: "Access Error",
                    description: errorData.message || "Failed to load users",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [searchTerm, roleFilter, users]);

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'customer',
            isActive: true
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            isActive: user.isActive
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingUser
                ? `/api/super-admin/users/${editingUser._id}`
                : '/api/super-admin/users/create';

            const method = editingUser ? 'PUT' : 'POST';

            const body = editingUser
                ? { name: formData.name, email: formData.email, role: formData.role, isActive: formData.isActive }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: editingUser ? "User updated successfully" : "User created successfully"
                });
                setIsDialogOpen(false);
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to save user",
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
        if (!deletingUser) return;

        try {
            const response = await fetch(`/api/super-admin/users/${deletingUser._id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "User deleted successfully"
                });
                setIsDeleteDialogOpen(false);
                setDeletingUser(null);
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete user",
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

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            super_admin: 'bg-purple-100 text-purple-800',
            admin: 'bg-blue-100 text-blue-800',
            writer: 'bg-green-100 text-green-800',
            qc: 'bg-yellow-100 text-yellow-800',
            customer: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || colors.customer;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="writer">Writer</SelectItem>
                                <SelectItem value="qc">QC</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                                {user.role.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(user)}
                                                    disabled={user._id === currentUserId && user.role === 'super_admin'}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setDeletingUser(user);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    disabled={user._id === currentUserId}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update user information' : 'Add a new user to the system'}
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
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        {!editingUser && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                                disabled={editingUser?._id === currentUserId}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="writer">Writer</SelectItem>
                                    <SelectItem value="qc">QC</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                disabled={editingUser?._id === currentUserId}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isActive" className="text-sm font-normal">
                                Active
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !formData.name || !formData.email || (!editingUser && !formData.password)}
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingUser ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={deletingUser?.name}
            />
        </div>
    );
}
