import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WriterEarningsPage() {
    const payouts = [
        { id: 'PAY-001', date: '2023-10-01', amount: 12000, status: 'Paid' },
        { id: 'PAY-002', date: '2023-09-01', amount: 11500, status: 'Paid' },
        { id: 'PAY-003', date: '2023-08-01', amount: 9800, status: 'Paid' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Earnings & Payouts</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹12,450</div>
                        <p className="text-xs text-muted-foreground mt-1">Available for payout</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹45,750</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
                    </CardContent>
                </Card>
                <Card className="flex items-center justify-center">
                    <Button size="lg">Request Payout</Button>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Payout ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((payout) => (
                                <tr key={payout.id} className="border-b">
                                    <td className="p-4 align-middle font-medium">{payout.id}</td>
                                    <td className="p-4 align-middle">{payout.date}</td>
                                    <td className="p-4 align-middle">₹{payout.amount}</td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">
                                            {payout.status}
                                        </span>
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
