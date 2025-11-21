"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.push('/admin/orders');
        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 bg-zinc-950 text-zinc-50">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-50">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-zinc-800 mb-4">
                        <ShieldCheck className="w-8 h-8 text-zinc-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Admin Console</CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Restricted access for administrators only
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-400">Admin Email</Label>
                            <Input id="email" type="email" placeholder="admin@loveunsent.com" className="bg-zinc-950 border-zinc-800 text-zinc-50" required />
                        </div>
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="password" className="text-zinc-400">Password</Label>
                            <Input id="password" type="password" className="bg-zinc-950 border-zinc-800 text-zinc-50" required />
                        </div>
                        <Button className="w-full mt-6 bg-zinc-50 text-zinc-950 hover:bg-zinc-200" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Login to Console'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
