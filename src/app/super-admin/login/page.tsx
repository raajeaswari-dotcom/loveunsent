"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.push('/super-admin/dashboard');
        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 bg-zinc-950 text-zinc-50">
            <Card className="w-full max-w-md border-red-900/50 bg-zinc-900 text-zinc-50">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-red-900/20 mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-red-500">Super Admin</CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Master control access. Authorized personnel only.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-400">Master Email</Label>
                            <Input id="email" type="email" placeholder="master@loveunsent.com" className="bg-zinc-950 border-zinc-800 text-zinc-50" required />
                        </div>
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="password" className="text-zinc-400">Master Key</Label>
                            <Input id="password" type="password" className="bg-zinc-950 border-zinc-800 text-zinc-50" required />
                        </div>
                        <Button className="w-full mt-6 bg-red-600 text-white hover:bg-red-700" disabled={loading}>
                            {loading ? 'Verifying Access...' : 'Enter Mainframe'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
