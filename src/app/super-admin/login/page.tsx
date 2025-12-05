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
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const email = (e.target as any).email.value;
            const password = (e.target as any).password.value;

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Check if user is actually a super admin
                if (data.data.user.role === 'super_admin') {
                    router.push('/super-admin/dashboard');
                    router.refresh();
                } else {
                    setError('Access Denied: You do not have super admin privileges.');
                    setLoading(false);
                }
            } else {
                setError(data.message || 'Invalid email or password');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login');
            setLoading(false);
        }
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

                        {error && (
                            <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-md mt-4">
                                {error}
                            </div>
                        )}

                        <Button className="w-full mt-6 bg-red-600 text-white hover:bg-red-700" disabled={loading}>
                            {loading ? 'Verifying Access...' : 'Enter Mainframe'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
