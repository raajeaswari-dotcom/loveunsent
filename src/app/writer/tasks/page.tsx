import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PenLine } from 'lucide-react';

export default function WriterTasksPage() {
    const tasks = [
        { id: 'ORD-2001', type: 'Letter', style: 'Cursive', words: 250, due: '2 hours', status: 'Pending' },
        { id: 'ORD-2002', type: 'Letter + Photo', style: 'Modern', words: 150, due: '4 hours', status: 'Pending' },
        { id: 'ORD-2003', type: 'Letter', style: 'Calligraphy', words: 300, due: '6 hours', status: 'In Progress' },
        { id: 'ORD-2004', type: 'Letter', style: 'Cursive', words: 200, due: 'Tomorrow', status: 'Pending' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Order ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Style</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Word Count</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Due In</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="border-b">
                                    <td className="p-4 align-middle font-medium">{task.id}</td>
                                    <td className="p-4 align-middle">{task.type}</td>
                                    <td className="p-4 align-middle">{task.style}</td>
                                    <td className="p-4 align-middle">{task.words}</td>
                                    <td className="p-4 align-middle text-orange-600 font-medium">{task.due}</td>
                                    <td className="p-4 align-middle text-right">
                                        <Link href={`/writer/tasks/${task.id}`}>
                                            <Button size="sm">
                                                <PenLine className="w-4 h-4 mr-2" />
                                                {task.status === 'In Progress' ? 'Continue' : 'Start'}
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
