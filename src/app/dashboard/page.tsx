"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersList from '@/components/customer/OrdersList';
import ProfileForm from '@/components/customer/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('orders');

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

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">My Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user.name}
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="orders">My Orders</TabsTrigger>
                    <TabsTrigger value="profile">Profile & Addresses</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                    <OrdersList />
                </TabsContent>

                <TabsContent value="profile">
                    <ProfileForm />
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
