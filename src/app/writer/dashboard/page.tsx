"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PenTool, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function WriterDashboardPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ activeTasks: 0, completedThisWeek: 0, pendingReview: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/writer/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setTasks(data.tasks);
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch writer dashboard data:', error);
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
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Writer Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name.split(' ')[0]}! You have {stats.activeTasks} active tasks.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                            <h3 className="text-2xl font-bold">{stats.activeTasks}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Completed This Week</p>
                            <h3 className="text-2xl font-bold">{stats.completedThisWeek}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                            <h3 className="text-2xl font-bold">{stats.pendingReview}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Tasks List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Tasks</h2>
                {tasks.length === 0 ? (
                    <Card className="p-10 text-center text-muted-foreground">
                        No active tasks. Enjoy your break!
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <Card key={task.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">Order #{task.id}</h3>
                                            <Badge variant={task.status === 'writing_in_progress' ? 'default' : 'secondary'}>
                                                {task.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {task.paper} • {task.style}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Link href={`/writer/tasks/${task.id}`}>
                                        <Button>
                                            Start Writing <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
