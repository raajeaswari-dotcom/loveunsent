"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

export default function ManageAdminsPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [promoting, setPromoting] = useState(false);
    const { toast } = useToast();

    const fetchAdmins = async () => {
        try {
            const response = await fetch('/api/super-admin/admins/list');
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.data.admins);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handlePromote = async () => {
        if (!newAdminEmail) return;
        setPromoting(true);
        try {
            const response = await fetch('/api/super-admin/admins/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newAdminEmail })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "User promoted to Admin successfully.",
                });
                setIsDialogOpen(false);
                setNewAdminEmail('');
                fetchAdmins();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to promote user.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setPromoting(false);
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manage Admins</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" /> Add New Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Promote User to Admin</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">User Email</Label>
                                <Input
                                    id="email"
                                    placeholder="Enter user email"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter the email of an existing user to promote them to Admin role.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handlePromote} disabled={promoting}>
                                {promoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Promote
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Administrator Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr key={admin._id} className="border-b">
                                    <td className="p-4 align-middle font-medium">{admin.name}</td>
                                    <td className="p-4 align-middle">{admin.email}</td>
                                    <td className="p-4 align-middle capitalize">{admin.role.replace('_', ' ')}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {admin.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        {admin.role !== 'super_admin' && (
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
