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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.push('/writer/dashboard'); // Assuming this exists or will exist
        }, 1000);
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
                        <Button className="w-full mt-6" disabled={loading}>
                            {loading ? 'Accessing Workspace...' : 'Enter Workspace'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
