"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function QCDashboardPage() {
    const [stats, setStats] = useState<any>({ pendingReviews: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '-' });
    const [priorityReviews, setPriorityReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/qc/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setPriorityReviews(data.priorityReviews);
                }
            } catch (error) {
                console.error('Failed to fetch QC dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">QC Dashboard</h1>
                <Link href="/qc/tasks">
                    <Button>Start Reviewing</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Pending Reviews"
                    value={stats.pendingReviews}
                    description="Awaiting approval"
                    icon={<Clock className="h-4 w-4 text-orange-500" />}
                />
                <StatsCard
                    title="Approved Today"
                    value={stats.approvedToday}
                    description="High quality work"
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                />
                <StatsCard
                    title="Rejected Today"
                    value={stats.rejectedToday}
                    description="Needs improvement"
                    icon={<XCircle className="h-4 w-4 text-red-500" />}
                />
                <StatsCard
                    title="Avg. Review Time"
                    value={stats.avgReviewTime}
                    description="Per letter"
                    icon={<ClipboardCheck className="h-4 w-4 text-blue-500" />}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Priority Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {priorityReviews.length > 0 ? (
                                priorityReviews.map((review: any) => (
                                    <div key={review.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">Order #{review.id}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Uploaded {new Date(review.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Link href={`/qc/tasks/${review.id}`}>
                                            <Button size="sm" variant="outline">Review Now</Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground">No pending reviews.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-muted-foreground text-sm">
                            Activity logs coming soon...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, description, icon }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
