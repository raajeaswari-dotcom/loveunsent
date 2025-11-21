"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-serif font-bold">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            <p>Verifying your email address...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                            <p>Your email has been successfully verified!</p>
                            <Link href="/login" className="w-full mt-4">
                                <Button className="w-full">Continue to Login</Button>
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-12 h-12 text-destructive" />
                            <p>Verification failed. The token may be invalid or expired.</p>
                            <Link href="/contact" className="w-full mt-4">
                                <Button variant="outline" className="w-full">Contact Support</Button>
                            </Link>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
