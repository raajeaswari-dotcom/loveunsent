"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export default function SystemSettingsPage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [userRegistration, setUserRegistration] = useState(true);

    return (
        <div className="space-y-6 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Global Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">Disable access for all non-admin users</p>
                        </div>
                        <Checkbox
                            checked={maintenanceMode}
                            onCheckedChange={(checked) => setMaintenanceMode(checked as boolean)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>New User Registration</Label>
                            <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                        </div>
                        <Checkbox
                            checked={userRegistration}
                            onCheckedChange={(checked) => setUserRegistration(checked as boolean)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>System Email Sender</Label>
                        <Input defaultValue="noreply@loveunsent.com" />
                    </div>

                    <Button>Save Configuration</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Database & Storage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline">Run Database Backup</Button>
                    <Button variant="outline">Clear Temporary Files</Button>
                    <Button variant="destructive">Reset System (Danger)</Button>
                </CardContent>
            </Card>
        </div>
    );
}
