import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QCHistoryPage() {
    const history = [
        { id: 'ORD-2999', writer: 'Sarah Writer', status: 'Approved', date: 'Today, 10:00 AM', reviewer: 'You' },
        { id: 'ORD-2998', writer: 'John Penman', status: 'Rejected', date: 'Today, 09:45 AM', reviewer: 'You' },
        { id: 'ORD-2995', writer: 'Mike Script', status: 'Approved', date: 'Yesterday, 04:30 PM', reviewer: 'You' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Review History</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Past Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Order ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Writer</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Reviewer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-4 align-middle font-medium">{item.id}</td>
                                    <td className="p-4 align-middle">{item.writer}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${item.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{item.date}</td>
                                    <td className="p-4 align-middle">{item.reviewer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
