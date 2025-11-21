import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Paper {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
}

interface PaperSelectorProps {
    papers: Paper[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const PaperSelector: React.FC<PaperSelectorProps> = ({ papers, selectedId, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.map((paper) => (
                <Card
                    key={paper.id}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2",
                        selectedId === paper.id ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => onSelect(paper.id)}
                >
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                        <Image
                            src={paper.image}
                            alt={paper.name}
                            fill
                            className="object-cover"
                            unoptimized // For local placeholders
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-lg">{paper.name}</h3>
                        <p className="text-sm text-muted-foreground">{paper.description}</p>
                        <p className="mt-2 font-bold">₹{paper.price}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
};
