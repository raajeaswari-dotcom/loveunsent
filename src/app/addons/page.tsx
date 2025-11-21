"use client";
import React, { useEffect, useState } from 'react';
import { mockApi } from '@/lib/mockApi';
import { AddonGrid } from '@/components/AddonGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AddonsPage() {
    const [addons, setAddons] = useState<any[]>([]);

    useEffect(() => {
        mockApi.getAddons().then(setAddons);
    }, []);

    return (
        <div className="container py-10 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-serif font-bold mb-4">Thoughtful Add-ons</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Make your gesture even more special with our selection of small gifts and keepsakes.
                </p>
            </div>

            <AddonGrid
                addons={addons}
                selectedIds={[]}
                onToggle={() => { }}
            />

            <div className="mt-12 text-center">
                <Link href="/customize">
                    <Button size="lg">Add Special Touches to Your Letter</Button>
                </Link>
            </div>
        </div>
    );
}
