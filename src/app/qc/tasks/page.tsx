import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function QCTasksPage() {
    const tasks = [
        { id: 'ORD-3001', writer: 'Sarah Writer', style: 'Cursive', uploadedAt: '10:30 AM', status: 'Pending' },
        { id: 'ORD-3002', writer: 'John Penman', style: 'Modern', uploadedAt: '11:15 AM', status: 'Pending' },
        { id: 'ORD-3003', writer: 'Sarah Writer', style: 'Calligraphy', uploadedAt: '11:45 AM', status: 'Pending' },
        { id: 'ORD-3004', writer: 'Mike Script', style: 'Cursive', uploadedAt: '12:00 PM', status: 'Pending' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Pending Reviews</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Order ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Writer</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Style</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Uploaded At</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="border-b">
                                    <td className="p-4 align-middle font-medium">{task.id}</td>
                                    <td className="p-4 align-middle">{task.writer}</td>
                                    <td className="p-4 align-middle">{task.style}</td>
                                    <td className="p-4 align-middle">{task.uploadedAt}</td>
                                    <td className="p-4 align-middle text-right">
                                        <Link href={`/qc/tasks/${task.id}`}>
                                            <Button size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review
                                            </Button>
                                        </Link>
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
