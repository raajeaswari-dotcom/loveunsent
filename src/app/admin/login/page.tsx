"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Smartphone, Mail, ArrowLeft } from 'lucide-react';

type LoginMethod = 'email' | 'mobile';
type Step = 'input' | 'verify';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [method, setMethod] = useState<LoginMethod>('email');
    const [step, setStep] = useState<Step>('input');

    // Form fields
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Resend timer
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const endpoint = method === 'email'
                ? '/api/auth/email/send-otp'
                : '/api/auth/mobile/send-otp';

            const body = method === 'email'
                ? { email, purpose: 'login' }
                : { phone, purpose: 'login' };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'OTP sent successfully!');
                setStep('verify');
                setResendTimer(60); // 60 seconds cooldown
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = method === 'email'
                ? '/api/auth/email/verify-otp'
                : '/api/auth/mobile/verify-otp';

            const body = method === 'email'
                ? { email, code: otp }
                : { phone, code: otp };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                // Verify user has admin or super_admin role
                const userRole = data.user.role?.toLowerCase();
                if (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'qc' && userRole !== 'writer') {
                    setError('Access denied. This portal is restricted to administrators, QC staff, and writers only.');
                    setLoading(false);
                    return;
                }

                // Login successful
                login(data.user);

                // Redirect based on role
                if (userRole === 'super_admin') {
                    router.push('/super-admin/dashboard');
                } else if (userRole === 'qc') {
                    router.push('/qc');
                } else if (userRole === 'writer') {
                    router.push('/writer/orders');
                } else {
                    router.push('/admin/dashboard');
                }
                router.refresh();
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setError('');
        setOtp('');
        await handleSendOTP(new Event('submit') as any);
    };

    const handleBack = () => {
        setStep('input');
        setOtp('');
        setError('');
        setSuccess('');
    };

    const handleMethodChange = (value: string) => {
        setMethod(value as LoginMethod);
        setStep('input');
        setError('');
        setSuccess('');
        setEmail('');
        setPhone('');
        setOtp('');
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 bg-zinc-950 text-zinc-50">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-50">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-zinc-800 mb-4">
                        <ShieldCheck className="w-8 h-8 text-zinc-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {step === 'input' ? 'Admin Console' : 'Verify OTP'}
                    </CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        {step === 'input'
                            ? 'Restricted access for administrators, QC, and writers only'
                            : `Enter the 6-digit code sent to your ${method === 'email' ? 'email' : 'mobile'}`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {step === 'input' ? (
                        <>
                            <Tabs value={method} onValueChange={(val) => handleMethodChange(val)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-zinc-950">
                                    <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-zinc-800">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </TabsTrigger>
                                    <TabsTrigger value="mobile" className="gap-2 data-[state=active]:bg-zinc-800">
                                        <Smartphone className="w-4 h-4" />
                                        Mobile
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="email">
                                    <form onSubmit={handleSendOTP} className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-zinc-400">Admin Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="admin@loveunsent.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-zinc-950 border-zinc-800 text-zinc-50"
                                                required
                                            />
                                        </div>

                                        {error && method === 'email' && (
                                            <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-md">
                                                {error}
                                            </div>
                                        )}

                                        {success && method === 'email' && (
                                            <div className="text-sm text-green-400 bg-green-950/50 border border-green-900 p-3 rounded-md">
                                                {success}
                                            </div>
                                        )}

                                        <Button
                                            className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                                            disabled={loading}
                                        >
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="mobile">
                                    <form onSubmit={handleSendOTP} className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-zinc-400">Admin Mobile</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+919876543210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="bg-zinc-950 border-zinc-800 text-zinc-50"
                                                required
                                            />
                                            <p className="text-xs text-zinc-500">
                                                Include country code (e.g., +91 for India)
                                            </p>
                                        </div>

                                        {error && method === 'mobile' && (
                                            <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-md">
                                                {error}
                                            </div>
                                        )}

                                        {success && method === 'mobile' && (
                                            <div className="text-sm text-green-400 bg-green-950/50 border border-green-900 p-3 rounded-md">
                                                {success}
                                            </div>
                                        )}

                                        <Button
                                            className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                                            disabled={loading}
                                        >
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className="mb-2 gap-2 text-zinc-400 hover:text-zinc-50"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>

                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-zinc-400">OTP Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    className="text-center text-2xl tracking-widest bg-zinc-950 border-zinc-800 text-zinc-50"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button
                                className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Authenticating...' : 'Login to Console'}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendTimer > 0}
                                    className="text-sm text-zinc-400 hover:text-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendTimer > 0
                                        ? `Resend OTP in ${resendTimer}s`
                                        : 'Resend OTP'
                                    }
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
