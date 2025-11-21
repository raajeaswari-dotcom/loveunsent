"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WriterUploadPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        // Simulate upload
        setTimeout(() => {
            setUploading(false);
            setCompleted(true);
            setTimeout(() => {
                router.push('/writer/dashboard');
            }, 1500);
        }, 2000);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 py-10">
            <h1 className="text-3xl font-bold tracking-tight text-center">Upload Draft</h1>
            <p className="text-center text-muted-foreground">Order {params.id}</p>

            <Card>
                <CardHeader>
                    <CardTitle>Submit for QC</CardTitle>
                </CardHeader>
                <CardContent>
                    {completed ? (
                        <div className="flex flex-col items-center justify-center py-10 text-green-600 space-y-4">
                            <div className="p-4 bg-green-100 rounded-full">
                                <Check className="w-8 h-8" />
                            </div>
                            <p className="font-medium">Upload Successful!</p>
                            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                                <p className="font-medium">Click to select or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-2">High resolution images only (JPG, PNG)</p>
                                <Input type="file" className="hidden" id="file-upload" />
                                <Label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
                            </div>

                            <div className="space-y-2">
                                <Label>Notes for QC (Optional)</Label>
                                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Any specific details about this draft..." />
                            </div>

                            <Button className="w-full" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Submit Work'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
