import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Handwriting {
    id: string;
    name: string;
    image: string;
    isCursive: boolean;
}

interface HandwritingCardProps {
    style: Handwriting;
    isSelected: boolean;
    onSelect: () => void;
}

export const HandwritingCard: React.FC<HandwritingCardProps> = ({ style, isSelected, onSelect }) => {
    return (
        <Card
            className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2",
                isSelected ? "border-primary" : "border-transparent"
            )}
            onClick={onSelect}
        >
            <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
                <Image
                    src={style.image}
                    alt={style.name}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
            <div className="p-3 text-center">
                <h3 className="font-medium text-sm">{style.name}</h3>
                <span className="text-xs text-muted-foreground">{style.isCursive ? 'Cursive' : 'Print'}</span>
            </div>
        </Card>
    );
};
