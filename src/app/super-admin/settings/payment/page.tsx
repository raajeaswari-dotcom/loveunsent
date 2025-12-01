"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const { toast } = useToast();

    const [settings, setSettings] = useState({
        provider: 'razorpay',
        publicKey: '',
        secretKey: '',
        isActive: true,
        isTestMode: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/super-admin/settings/payment');
            if (response.ok) {
                const data = await response.json();
                setSettings(data.data.settings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setTestResult(null);
        try {
            const response = await fetch('/api/super-admin/settings/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Payment settings updated successfully"
                });
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update settings",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const response = await fetch('/api/super-admin/settings/payment/test', {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                setTestResult({ success: true, message: data.data.details });
            } else {
                setTestResult({ success: false, message: data.message || "Connection failed" });
            }
        } catch (error) {
            setTestResult({ success: false, message: "Network error occurred" });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Gateway</h1>
                <p className="text-muted-foreground mt-2">
                    Configure payment providers and manage API keys.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        Select your payment provider and enter the API credentials.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="provider">Payment Provider</Label>
                        <Select
                            value={settings.provider}
                            onValueChange={(value) => setSettings({ ...settings, provider: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="razorpay">Razorpay</SelectItem>
                                <SelectItem value="stripe">Stripe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="publicKey">Public Key / API Key</Label>
                        <Input
                            id="publicKey"
                            value={settings.publicKey}
                            onChange={(e) => setSettings({ ...settings, publicKey: e.target.value })}
                            placeholder={settings.provider === 'razorpay' ? 'rzp_test_...' : 'pk_test_...'}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="secretKey">Secret Key</Label>
                        <Input
                            id="secretKey"
                            type="password"
                            value={settings.secretKey}
                            onChange={(e) => setSettings({ ...settings, secretKey: e.target.value })}
                            placeholder="Enter secret key"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base">Test Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable to use test credentials (sandbox environment).
                            </p>
                        </div>
                        <Switch
                            checked={settings.isTestMode}
                            onCheckedChange={(checked) => setSettings({ ...settings, isTestMode: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable Payments</Label>
                            <p className="text-sm text-muted-foreground">
                                Turn on to accept payments on the checkout page.
                            </p>
                        </div>
                        <Switch
                            checked={settings.isActive}
                            onCheckedChange={(checked) => setSettings({ ...settings, isActive: checked })}
                        />
                    </div>

                    {testResult && (
                        <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "border-green-500 text-green-700 bg-green-50" : ""}>
                            {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                            <AlertDescription>
                                {testResult.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={handleTestConnection}
                            disabled={testing || !settings.publicKey || !settings.secretKey}
                        >
                            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Test Connection
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
