import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Perfume {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface PerfumeSelectorProps {
    perfumes: Perfume[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const PerfumeSelector: React.FC<PerfumeSelectorProps> = ({ perfumes, selectedId, onSelect }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {perfumes.map((perfume) => (
                <Card
                    key={perfume.id}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2 flex flex-col items-center p-4 text-center",
                        selectedId === perfume.id ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => onSelect(perfume.id)}
                >
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted mb-3">
                        <Image
                            src={perfume.image}
                            alt={perfume.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <h3 className="font-medium text-sm">{perfume.name}</h3>
                    <p className="text-xs text-muted-foreground font-bold">+₹{perfume.price}</p>
                </Card>
            ))}
        </div>
    );
};
