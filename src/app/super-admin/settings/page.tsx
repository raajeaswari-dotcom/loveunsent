"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SystemSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        addonsEnabled: true,
        paymentMethods: {
            cod: true,
            online: true
        },
        maintenanceMode: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/system-settings');
            const data = await response.json();
            if (response.ok && data.data?.settings) {
                setSettings(data.data.settings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load system settings',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/system-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'System settings updated successfully',
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to save system settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>

            {/* Feature Flags */}
            <Card>
                <CardHeader>
                    <CardTitle>Feature Control</CardTitle>
                    <CardDescription>Enable or disable specific modules of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-0.5">
                            <Label className="text-base">Add-ons Module</Label>
                            <p className="text-sm text-muted-foreground">
                                Show the 'Add-ons' step in the letter customization flow.
                            </p>
                        </div>
                        <Switch
                            checked={settings.addonsEnabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, addonsEnabled: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Payment Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Configuration</CardTitle>
                    <CardDescription>Control which payment methods are available to customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-0.5">
                            <Label className="text-base">Cash on Delivery (COD)</Label>
                            <p className="text-sm text-muted-foreground">Allow customers to pay upon delivery.</p>
                        </div>
                        <Switch
                            checked={settings.paymentMethods.cod}
                            onCheckedChange={(checked) => setSettings({
                                ...settings,
                                paymentMethods: { ...settings.paymentMethods, cod: checked }
                            })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-0.5">
                            <Label className="text-base">Online Payment</Label>
                            <p className="text-sm text-muted-foreground">Allow regular online payments (Razorpay/Stripe).</p>
                        </div>
                        <Switch
                            checked={settings.paymentMethods.online}
                            onCheckedChange={(checked) => setSettings({
                                ...settings,
                                paymentMethods: { ...settings.paymentMethods, online: checked }
                            })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-900">Danger Zone</CardTitle>
                    <CardDescription>Advanced system controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="space-y-0.5">
                            <Label className="text-base text-red-900">Maintenance Mode</Label>
                            <p className="text-sm text-red-700">
                                When enabled, only Admins can access the site. Customers will see a maintenance page.
                            </p>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                            className="data-[state=checked]:bg-red-600"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
