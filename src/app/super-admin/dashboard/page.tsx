"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, PenTool, Server, Loader2 } from 'lucide-react';

export default function SuperAdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setLogs(data.recentLogs);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
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
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || '0'}`}
                    description="All time"
                    icon={<Server className="h-4 w-4 text-purple-500" />}
                />
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers?.toString() || '0'}
                    description="Registered users"
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                />
                <StatsCard
                    title="Active Writers"
                    value={stats?.activeWriters?.toString() || '0'}
                    description="Across all regions"
                    icon={<PenTool className="h-4 w-4 text-orange-500" />}
                />
                <StatsCard
                    title="System Status"
                    value={stats?.systemStatus || 'Unknown'}
                    description="API & DB"
                    icon={<Shield className="h-4 w-4 text-green-500" />}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Database Load</span>
                                <span className="text-sm text-green-600">12%</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[12%]" />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Storage Usage</span>
                                <span className="text-sm text-yellow-600">65%</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-yellow-500 h-full w-[65%]" />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">API Latency</span>
                                <span className="text-sm text-green-600">45ms</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[20%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent System Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm font-mono">
                            {logs.length > 0 ? (
                                logs.map((log: any) => (
                                    <div key={log._id} className="flex gap-2 items-start">
                                        <span className="text-muted-foreground whitespace-nowrap">
                                            [{new Date(log.createdAt).toLocaleTimeString()}]
                                        </span>
                                        <span className="text-blue-600 font-bold">{log.action}</span>
                                        <span className="break-all">
                                            {log.targetModel} {log.targetId} by {log.adminId?.name || 'Unknown'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground">No recent logs found.</div>
                            )}
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
