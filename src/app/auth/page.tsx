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
    const { login } = useAuth();

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

    // Timer
    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer]);

    const formatPhoneNumber = (value: string) => {
        if (value.startsWith("+")) return value;
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length > 0) {
            if (cleaned.startsWith("91") && cleaned.length > 2) return "+" + cleaned;
            return "+91" + cleaned;
        }
        return value;
    };

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone);

    /* -----------------------------------------
       SEND OTP
    ------------------------------------------ */
    const handleSendOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

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
                console.error("Send OTP Error:", data.message);
                setError(data.message || "Failed to send OTP");
            } else {
                setSuccess(`OTP sent to your ${method}`);
                setStep("otp");
                setResendTimer(60);
                setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000));
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------
       VERIFY OTP (DEBUG VERSION)
    ------------------------------------------ */
    const handleVerifyOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        setLoading(true);

        const otpCode = otp.join("");

        // 🔍 DEBUG: What client is sending
        console.log("🔐 [Client] Verifying OTP", {
            method,
            email,
            phone,
            otpCode
        });

        if (otpCode.length !== 6) {
            setError("Please enter a 6-digit code");
            setLoading(false);
            return;
        }

        const endpoint =
            method === "email"
                ? "/api/auth/email/verify-otp"
                : "/api/auth/mobile/verify-otp";

        const body =
            method === "email"
                ? {
                      email: email.toLowerCase().trim(),
                      code: otpCode,
                      name: isNewUser ? name : undefined,
                  }
                : {
                      phone,
                      code: otpCode,
                      name: isNewUser ? name : undefined,
                  };

        // DEBUG: Log outgoing request
        console.log("🔐 [Client] POST →", endpoint, body);

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            // 🔍 DEBUG: Response log
            console.log("🔐 [Client] verify response:", res.status, data);

            if (data.isNewUser && !name) {
                setIsNewUser(true);
                setStep("name");
                setLoading(false);
                return;
            }

            if (!res.ok) {
                setError(data.message || "Invalid OTP");
                setOtp(["", "", "", "", "", ""]);
                otpRefs.current[0]?.focus();
            } else {
                login(data.user);
                setSuccess("Login successful!");
                setTimeout(() => router.push("/dashboard"), 500);
            }
        } catch (err) {
            console.error("🔐 [Client] Network error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------
       OTP INPUT HANDLERS
    ------------------------------------------ */
    const handleOtpChange = (i: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[i] = digit;
        setOtp(newOtp);

        if (digit && i < 5) otpRefs.current[i + 1]?.focus();

        if (i === 5 && digit && newOtp.every((d) => d)) {
            setTimeout(() => handleVerifyOTP(), 100);
        }
    };

    const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            otpRefs.current[i - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);

        const last = Math.min(pasted.length, 5);
        otpRefs.current[last]?.focus();

        if (pasted.length === 6) setTimeout(() => handleVerifyOTP(), 100);
    };

    /* -----------------------------------------
       RESEND
    ------------------------------------------ */
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setOtp(["", "", "", "", "", ""]);
        await handleSendOTP();
    };

    const handleBack = () => {
        setStep("identifier");
        setOtp(["", "", "", "", "", ""]);
        setName("");
        setIsNewUser(false);
        setError("");
        setSuccess("");
    };

    /* -----------------------------------------
       RENDER UI
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

                    {/* IDENTIFIER STEP */}
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

                                {/* EMAIL INPUT */}
                                <TabsContent value="email" className="space-y-3 mt-4">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={email && !isValidEmail(email) ? "border-red-500" : ""}
                                        required
                                    />
                                    {email && !isValidEmail(email) && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Invalid email
                                        </p>
                                    )}
                                </TabsContent>

                                {/* PHONE INPUT */}
                                <TabsContent value="mobile" className="space-y-3 mt-4">
                                    <Label>Mobile Number</Label>
                                    <Input
                                        type="tel"
                                        placeholder="+919876543210"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                        className={phone && !isValidPhone(phone) ? "border-red-500" : ""}
                                        required
                                    />
                                </TabsContent>
                            </Tabs>

                            {error && (
                                <div className="bg-red-50 text-red-700 border px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 text-green-700 border px-4 py-3 rounded">
                                    {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || (method === "email" ? !isValidEmail(email) : !isValidPhone(phone))}
                                className="w-full"
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
                        </form>
                    )}

                    {/* OTP STEP */}
                    {step === "otp" && (
                        <div className="space-y-4">
                            <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-2">
                                <ArrowLeft className="w-4 h-4" />
                                Change {method}
                            </Button>

                            <div className="bg-blue-50 text-blue-700 border px-4 py-3 rounded">
                                OTP sent to {method === "email" ? email : phone}
                            </div>

                            {/* OTP INPUT */}
                            <Label className="text-center block">Enter OTP</Label>
                            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                {otp.map((d, i) => (
                                    <Input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={d}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-12 text-center text-xl font-semibold"
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-700 border px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={() => handleVerifyOTP()}
                                disabled={otp.some((d) => !d) || loading}
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

                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resendTimer > 0}
                                className="text-sm text-center w-full text-primary"
                            >
                                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                            </button>
                        </div>
                    )}

                    {/* NAME STEP */}
                    {step === "name" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>

                            <div className="bg-blue-50 border text-blue-700 px-4 py-3 rounded">
                                Welcome! Please enter your name.
                            </div>

                            <Label>Full Name</Label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            {error && (
                                <div className="bg-red-50 text-red-700 border px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={!name || loading} className="w-full">
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
