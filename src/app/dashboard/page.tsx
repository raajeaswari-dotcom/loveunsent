"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OrdersList from '@/components/customer/OrdersList';
import ProfileForm from '@/components/customer/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Package, User, MapPin, PenTool, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function DashboardContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Optional: Update URL without full refresh to allow bookmarking/back button?
        // router.push(`/dashboard?tab=${value}`, { scroll: false });
    };

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const overviewCards = [
        {
            title: 'Your Orders',
            description: 'Track, return, or buy things again',
            icon: Package,
            action: () => handleTabChange('orders'),
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
        {
            title: 'Login & Security',
            description: 'Edit login, name, and mobile number',
            icon: User,
            action: () => handleTabChange('profile'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Your Addresses',
            description: 'Edit addresses for orders',
            icon: MapPin,
            action: () => handleTabChange('profile'), // Addresses are in ProfileForm
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Write a Letter',
            description: 'Create something beautiful',
            icon: PenTool,
            action: () => router.push('/customize'),
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Contact Us',
            description: 'Get help with your orders',
            icon: HelpCircle,
            action: () => router.push('/contact'),
            color: 'text-teal-600',
            bgColor: 'bg-teal-100'
        }
    ];

    return (
        <div className="container py-10 px-4 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold mb-2">Your Account</h1>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="font-semibold text-primary">{user.name}</span>
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {overviewCards.map((card, index) => (
                            <Card
                                key={index}
                                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 group"
                                onClick={card.action}
                            >
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${card.bgColor} ${card.color} group-hover:scale-110 transition-transform`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{card.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {card.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="orders">
                    <div className="mb-4">
                        <Button
                            variant="ghost"
                            className="gap-2 pl-0 hover:bg-transparent hover:text-primary"
                            onClick={() => setActiveTab('overview')}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </div>
                    <OrdersList />
                </TabsContent>

                <TabsContent value="profile">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <Button
                                variant="ghost"
                                className="w-fit gap-2 pl-0 hover:bg-transparent hover:text-primary"
                                onClick={() => setActiveTab('overview')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Profile & Settings</h2>
                                <p className="text-muted-foreground">Manage your personal information and addresses</p>
                            </div>
                        </div>
                        <ProfileForm />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
