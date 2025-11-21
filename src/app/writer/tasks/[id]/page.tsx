"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, FileText, Mic, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function WriterTaskDetailsPage({ params }: { params: { id: string } }) {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [draftUrl, setDraftUrl] = useState<string | null>(null);

    useEffect(() => {
        // Mock fetch task details
        const fetchTask = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setTask({
                id: params.id,
                customer: "Priya M.",
                status: "assigned",
                inputMethod: "text",
                message: "Dearest Rohan,\n\nI hope this letter finds you well. It's been so long since we last spoke...",
                paper: "Premium Ivory",
                style: "Elegant Cursive",
                dueDate: new Date(Date.now() + 86400000 * 2).toISOString()
            });
            setLoading(false);
        };
        fetchTask();
    }, [params.id]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        // Simulate upload
        setTimeout(() => {
            setDraftUrl("https://placehold.co/600x800/png?text=Draft+Preview");
            setUploading(false);
        }, 1500);
    };

    const handleSubmit = () => {
        if (!draftUrl) return;
        alert("Draft submitted for QC!");
        // Navigate back or update status
    };

    if (loading) return <div className="p-10 text-center">Loading task...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/writer/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order #{task.id}</h1>
                    <p className="text-muted-foreground">Due by {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline" className="text-lg px-4 py-1 capitalize">
                        {task.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instructions & Content */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Writing Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Paper Type</span>
                                <span className="font-medium">{task.paper}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Handwriting Style</span>
                                <span className="font-medium">{task.style}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Content to Write
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 bg-muted/30 rounded-lg font-serif text-lg leading-relaxed whitespace-pre-wrap border">
                                {task.message}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Work Area */}
                <div className="space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Upload Your Work</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-6">
                            <div className="flex-1 border-2 border-dashed rounded-xl overflow-hidden bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative">
                                {draftUrl ? (
                                    <>
                                        <img src={draftUrl} alt="Draft" className="w-full h-full object-contain absolute inset-0" />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="absolute bottom-4 right-4 z-10"
                                            onClick={() => setDraftUrl(null)}
                                        >
                                            Remove
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Upload a photo of the handwritten letter
                                        </p>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="max-w-xs mx-auto"
                                            onChange={handleUpload}
                                            disabled={uploading}
                                        />
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                                        <span className="animate-pulse font-medium">Uploading...</span>
                                    </div>
                                )}
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                disabled={!draftUrl}
                                onClick={handleSubmit}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Submit for QC
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
