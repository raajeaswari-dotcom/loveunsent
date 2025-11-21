import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function ManageWritersPage() {
    const writers = [
        { id: 1, name: 'Sarah Writer', email: 'sarah@loveunsent.com', status: 'Active', joined: '2023-01-15' },
        { id: 2, name: 'John Penman', email: 'john@loveunsent.com', status: 'Active', joined: '2023-02-20' },
        { id: 3, name: 'Mike Script', email: 'mike@loveunsent.com', status: 'Inactive', joined: '2023-03-10' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manage Writers</h1>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Writer
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Writer Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Joined</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {writers.map((writer) => (
                                <tr key={writer.id} className="border-b">
                                    <td className="p-4 align-middle font-medium">{writer.name}</td>
                                    <td className="p-4 align-middle">{writer.email}</td>
                                    <td className="p-4 align-middle">{writer.joined}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${writer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'
                                            }`}>
                                            {writer.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
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
