"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VerificationPromptProps {
    type: 'email' | 'phone';
    identifier: string;
    message?: string;
    onVerified?: () => void;
}

export default function VerificationPrompt({
    type,
    identifier,
    message,
    onVerified
}: VerificationPromptProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    React.useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendOTP = async () => {
        setLoading(true);
        setError('');

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
                setOtpSent(true);
                setSuccess(`OTP sent to your ${type}`);
                setResendTimer(60);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        setError('');

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
                setSuccess(`${type === 'email' ? 'Email' : 'Phone'} verified successfully!`);
                setTimeout(() => {
                    if (onVerified) {
                        onVerified();
                    } else {
                        router.refresh();
                    }
                }, 1000);
            } else {
                setError(data.message || 'Invalid OTP');
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
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

        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        if (index === 5 && digit && newOtp.every(d => d)) {
            setTimeout(() => handleVerifyOTP(), 100);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {type === 'email' ? (
                            <Mail className="w-6 h-6 text-primary" />
                        ) : (
                            <Smartphone className="w-6 h-6 text-primary" />
                        )}
                        <CardTitle>
                            {type === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {message || `To continue, please verify your ${type === 'email' ? 'email address' : 'phone number'}.`}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {!otpSent ? (
                        <>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    We'll send a verification code to <strong>{identifier}</strong>
                                </AlertDescription>
                            </Alert>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    `Send Verification Code`
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {success && !error && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground text-center">
                                    Enter the 6-digit code sent to {identifier}
                                </p>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleVerifyOTP}
                                disabled={otp.some(d => !d) || loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={resendTimer > 0 || loading}
                                    className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                >
                                    {resendTimer > 0
                                        ? `Resend code in ${resendTimer}s`
                                        : 'Resend verification code'}
                                </button>
                            </div>
                        </>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-xs text-center text-muted-foreground">
                            This helps us keep your account secure and send you important updates about your orders.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
