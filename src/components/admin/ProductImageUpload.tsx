"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { getCloudinaryUrl } from '@/lib/cloudinaryClient';

interface ProductImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export function ProductImageUpload({ value, onChange, label = "Product Image" }: ProductImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/public', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            if (data.data?.url || data.data?.imageUrl) {
                onChange(data.data.url || data.data.imageUrl);
            } else {
                throw new Error('No URL returned from upload');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange('');
        setError(null);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {value ? (
                <div className="relative inline-block">
                    <Image
                        src={getCloudinaryUrl(value)}
                        alt="Product preview"
                        width={200}
                        height={200}
                        className="rounded-md border object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                            {uploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground">
                                {uploading ? 'Uploading...' : 'Click to upload image'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                PNG, JPG up to 5MB
                            </span>
                        </div>
                    </Label>
                </div>
            )}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
