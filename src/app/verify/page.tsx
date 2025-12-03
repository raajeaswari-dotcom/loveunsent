"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Smartphone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, refreshUser, loading: authLoading } = useAuth();

    const type = searchParams?.get('type') as 'email' | 'mobile' | null;
    const action = searchParams?.get('action');

    const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = Array(6).fill(null).map(() => null);

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        if (!user) {
            router.push('/auth');
            return;
        }

        // If user already has this verified, redirect to dashboard
        if (type === 'email' && user.emailVerified) {
            router.push('/dashboard');
        }
        if (type === 'mobile' && user.phoneVerified) {
            router.push('/dashboard');
        }

        // If adding (not verifying), start at input step
        // If just verifying, pre-fill and go to OTP step
        if (action !== 'add') {
            if (type === 'email' && user.email) {
                setIdentifier(user.email);
            }
            if (type === 'mobile' && user.phone) {
                setIdentifier(user.phone);
            }
        }
    }, [user, type, action, router, authLoading]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = type === 'email'
            ? '/api/auth/email/send-otp'
            : '/api/auth/mobile/send-otp';

        const body = type === 'email'
            ? { email: identifier, purpose: 'verification' }
            : { phone: identifier, purpose: 'verification' };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setStep('otp');
                setResendTimer(60);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setLoading(true);

        const otpCode = otp.join('');
        const endpoint = type === 'email'
            ? '/api/auth/email/verify-otp'
            : '/api/auth/mobile/verify-otp';

        const body = type === 'email'
            ? { email: identifier, code: otpCode }
            : { phone: identifier, code: otpCode };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setStep('success');
                refreshUser();
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setError(data.message || 'Invalid OTP');
                setOtp(['', '', '', '', '', '']);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        if (digit && index < 5 && otpRefs[index + 1]) {
            (otpRefs[index + 1] as any)?.focus();
        }

        if (index === 5 && digit && newOtp.every(d => d)) {
            setTimeout(() => handleVerifyOTP(), 100);
        }
    };

    // Show loading while auth is loading
    if (authLoading) {
        return null;
    }

    if (!type || !user) {
        return null;
    }

    const Icon = type === 'email' ? Mail : Smartphone;
    const label = type === 'email' ? 'Email Address' : 'Mobile Number';

    return (
        <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-primary" />
                        <CardTitle>
                            {step === 'success' ? 'Verified!' : action === 'add' ? `Add ${label}` : `Verify ${label}`}
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {step === 'input' && `Enter your ${label} to verify your account`}
                        {step === 'otp' && `Enter the 6-digit code sent to ${identifier}`}
                        {step === 'success' && `Your ${label} has been verified successfully!`}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {step === 'input' && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="gap-2 -ml-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>

                            <div className="space-y-2">
                                <Label htmlFor="identifier">{label}</Label>
                                <Input
                                    id="identifier"
                                    type={type === 'email' ? 'email' : 'tel'}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={type === 'email' ? 'you@example.com' : '+919876543210'}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <div className="space-y-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep('input')}
                                className="gap-2 -ml-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Change {label}
                            </Button>

                            <div className="space-y-2">
                                <Label className="text-center block">Enter OTP</Label>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el: any) => { otpRefs[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            className="w-12 h-12 text-center text-xl font-semibold"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={() => handleVerifyOTP()}
                                disabled={otp.some(d => !d) || loading}
                                className="w-full"
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Verify
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => handleSendOTP()}
                                    disabled={resendTimer > 0}
                                    className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-4 py-8">
                            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                            <p className="text-lg font-medium">Verification Complete!</p>
                            <p className="text-sm text-muted-foreground">
                                Redirecting to dashboard...
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
