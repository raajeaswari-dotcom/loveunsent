"use client";
import React, { useEffect, useState } from 'react';
import { mockApi } from '@/lib/mockApi';
import { HandwritingCard } from '@/components/HandwritingCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HandwritingPage() {
    const [styles, setStyles] = useState<any[]>([]);

    useEffect(() => {
        mockApi.getHandwritingStyles().then(setStyles);
    }, []);

    return (
        <div className="container py-10 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-serif font-bold mb-4">Handwriting Styles</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    From elegant cursive to neat print, find the perfect style that matches your voice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {styles.map(style => (
                    <HandwritingCard
                        key={style.id}
                        style={style}
                        isSelected={false}
                        onSelect={() => { }}
                    />
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link href="/customize">
                    <Button size="lg">Write in Your Chosen Style</Button>
                </Link>
            </div>
        </div>
    );
}
