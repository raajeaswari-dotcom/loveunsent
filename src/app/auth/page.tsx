"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Smartphone, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type LoginMethod = "email" | "mobile";
type Step = "identifier" | "otp" | "name";

export default function AuthPage() {
    const router = useRouter();
    const { login, user, loading: authLoading } = useAuth();

    // Form state
    const [method, setMethod] = useState<LoginMethod>("email");
    const [step, setStep] = useState<Step>("identifier");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [name, setName] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);

    // OTP input refs
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Don't auto-redirect logged-in users - let the manual redirect after login handle it
    // This prevents conflicts with the redirect to /dashboard after successful login

    // Format phone number
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned.startsWith("91") && cleaned.length > 0) {
            return "+91" + cleaned;
        }
        return cleaned.startsWith("91") ? "+" + cleaned : value;
    };

    // Validate email
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validate phone
    const isValidPhone = (phone: string) => {
        return /^\+?[1-9]\d{1,14}$/.test(phone);
    };

    /* -----------------------------------------
       SEND OTP
    ------------------------------------------ */
    const handleSendOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const identifier = method === "email" ? email : phone;
        const endpoint =
            method === "email"
                ? "/api/auth/email/send-otp"
                : "/api/auth/mobile/send-otp";

        const body =
            method === "email"
                ? { email: email.toLowerCase().trim(), purpose: "login" }
                : { phone, purpose: "login" };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to send OTP");
            } else {
                setSuccess(`OTP sent to your ${method}`);
                setStep("otp");
                setResendTimer(60);
                setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
                // Auto-focus first OTP input
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------
       VERIFY OTP
    ------------------------------------------ */
    const handleVerifyOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        setLoading(true);

        const otpCode = otp.join("");
        const endpoint =
            method === "email"
                ? "/api/auth/email/verify-otp"
                : "/api/auth/mobile/verify-otp";

        const body =
            method === "email"
                ? { email: email.toLowerCase().trim(), code: otpCode, name: isNewUser ? name : undefined }
                : { phone, code: otpCode, name: isNewUser ? name : undefined };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            // New user needs to provide name
            if (data.isNewUser && !name) {
                setIsNewUser(true);
                setStep("name");
                setLoading(false);
                return;
            }

            if (!res.ok) {
                setError(data.message || "Invalid OTP");
                // Clear OTP on error
                setOtp(["", "", "", "", "", ""]);
                otpRefs.current[0]?.focus();
            } else {
                // Success - login user
                login(data.user);
                setSuccess("Login successful!");
                setTimeout(() => router.push("/dashboard"), 500);
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------
       HANDLE OTP INPUT
    ------------------------------------------ */
    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, "").slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-focus next input
        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (index === 5 && digit && newOtp.every(d => d)) {
            setTimeout(() => handleVerifyOTP(), 100);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);

        // Focus last filled input or submit
        const lastIndex = Math.min(pastedData.length, 5);
        otpRefs.current[lastIndex]?.focus();

        if (pastedData.length === 6) {
            setTimeout(() => handleVerifyOTP(), 100);
        }
    };

    /* -----------------------------------------
       RESEND OTP
    ------------------------------------------ */
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setOtp(["", "", "", "", "", ""]);
        await handleSendOTP();
    };

    /* -----------------------------------------
       BACK NAVIGATION
    ------------------------------------------ */
    const handleBack = () => {
        if (step === "otp" || step === "name") {
            setStep("identifier");
            setOtp(["", "", "", "", "", ""]);
            setName("");
            setIsNewUser(false);
            setError("");
            setSuccess("");
        }
    };

    /* -----------------------------------------
       RENDER
    ------------------------------------------ */
    return (
        <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-serif text-center">
                        {step === "identifier" && "Welcome"}
                        {step === "otp" && "Verify OTP"}
                        {step === "name" && "Complete Your Profile"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {step === "identifier" && `Sign in or create an account with your ${method}`}
                        {step === "otp" && `Enter the 6-digit code sent to your ${method}`}
                        {step === "name" && "Please provide your name to continue"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* STEP 1: IDENTIFIER INPUT */}
                    {step === "identifier" && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <Tabs
                                value={method}
                                onValueChange={(v) => {
                                    setMethod(v as LoginMethod);
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                <TabsList className="grid grid-cols-2 w-full">
                                    <TabsTrigger value="email" className="gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </TabsTrigger>
                                    <TabsTrigger value="mobile" className="gap-2">
                                        <Smartphone className="w-4 h-4" />
                                        Mobile
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="email" className="space-y-3 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className={email && !isValidEmail(email) ? "border-red-500" : ""}
                                        />
                                        {email && !isValidEmail(email) && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Please enter a valid email address
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="mobile" className="space-y-3 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Mobile Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+919876543210"
                                            value={phone}
                                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                            required
                                            className={phone && !isValidPhone(phone) ? "border-red-500" : ""}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Include country code (e.g., +91 for India)
                                        </p>
                                        {phone && !isValidPhone(phone) && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Please enter a valid phone number with country code
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{success}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || (method === "email" ? !isValidEmail(email) : !isValidPhone(phone))}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground pt-2">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </form>
                    )}

                    {/* STEP 2: OTP VERIFICATION */}
                    {step === "otp" && (
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="gap-2 -ml-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Change {method}
                            </Button>

                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                                <p className="text-sm font-medium">
                                    OTP sent to {method === "email" ? email : phone}
                                </p>
                                {otpExpiry && (
                                    <p className="text-xs mt-1">
                                        Valid for {Math.max(0, Math.floor((otpExpiry.getTime() - Date.now()) / 1000 / 60))} minutes
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-center block">Enter OTP</Label>
                                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-xl font-semibold"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                onClick={() => handleVerifyOTP()}
                                disabled={otp.some(d => !d) || loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify & Continue"
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendTimer > 0}
                                    className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                >
                                    {resendTimer > 0
                                        ? `Resend OTP in ${resendTimer}s`
                                        : "Resend OTP"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: NAME INPUT (for new users) */}
                    {step === "name" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className="gap-2 -ml-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>

                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                                <p className="text-sm">
                                    Welcome! We need a few more details to create your account.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    minLength={2}
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will be used for your orders and communications
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={!name || name.length < 2 || loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
