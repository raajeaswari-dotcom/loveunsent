"use client";
import React, { useEffect, useState } from 'react';
import { mockApi } from '@/lib/mockApi';
import { PaperSelector } from '@/components/PaperSelector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaperPage() {
    const [papers, setPapers] = useState<any[]>([]);

    useEffect(() => {
        mockApi.getProducts().then(setPapers);
    }, []);

    return (
        <div className="container py-10 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-serif font-bold mb-4">Our Paper Collection</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Choose from our exquisite range of premium papers, ranging from vintage parchment to luxurious ivory textures.
                </p>
            </div>

            <PaperSelector
                papers={papers}
                selectedId=""
                onSelect={() => { }}
            />

            <div className="mt-12 text-center">
                <Link href="/customize">
                    <Button size="lg">Start Customizing with Your Favorite Paper</Button>
                </Link>
            </div>
        </div>
    );
}
