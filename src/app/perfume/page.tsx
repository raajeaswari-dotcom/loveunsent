"use client";
import React, { useEffect, useState } from 'react';
import { mockApi } from '@/lib/mockApi';
import { PerfumeSelector } from '@/components/PerfumeSelector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PerfumePage() {
    const [perfumes, setPerfumes] = useState<any[]>([]);

    useEffect(() => {
        mockApi.getPerfumes().then(setPerfumes);
    }, []);

    return (
        <div className="container py-10 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-serif font-bold mb-4">Signature Scents</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Add a sensory dimension to your letter with our curated fragrances.
                </p>
            </div>

            <PerfumeSelector
                perfumes={perfumes}
                selectedId=""
                onSelect={() => { }}
            />

            <div className="mt-12 text-center">
                <Link href="/customize">
                    <Button size="lg">Create a Scented Letter</Button>
                </Link>
            </div>
        </div>
    );
}
