import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WriterProfilePage() {
    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input defaultValue="Sarah" />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input defaultValue="Writer" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input defaultValue="sarah@loveunsent.com" disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input defaultValue="+91 98765 43210" />
                    </div>

                    <div className="space-y-2">
                        <Label>Shipping Address (for kits)</Label>
                        <Input defaultValue="123 Writer Lane, Mumbai" />
                    </div>

                    <div className="pt-4">
                        <Button>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Handwriting Samples</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                            Sample 1
                        </div>
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                            Sample 2
                        </div>
                    </div>
                    <Button variant="outline" className="mt-4 w-full">Update Samples</Button>
                </CardContent>
            </Card>
        </div>
    );
}
