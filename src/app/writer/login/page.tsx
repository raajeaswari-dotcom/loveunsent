"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WriterLoginPage() {
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
                // Check if user is actually a writer
                if (data.data.user.role === 'writer') {
                    router.push('/writer/orders');
                    router.refresh();
                } else {
                    setError('Access Denied: This portal is for writers only.');
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
        <div className="flex items-center justify-center min-h-[80vh] px-4 bg-muted/20">
            <Card className="w-full max-w-md border-primary/20">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                        <PenTool className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-serif font-bold text-center">Writer Portal</CardTitle>
                    <CardDescription className="text-center">
                        Access your assignments and workspace
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Writer Email</Label>
                            <Input id="email" type="email" placeholder="writer@loveunsent.com" required />
                        </div>
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md mt-4">
                                {error}
                            </div>
                        )}

                        <Button className="w-full mt-6" disabled={loading}>
                            {loading ? 'Accessing Workspace...' : 'Enter Workspace'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
