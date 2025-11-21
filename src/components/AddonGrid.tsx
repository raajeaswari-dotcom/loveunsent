import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

interface Addon {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface AddonGridProps {
    addons: Addon[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

export const AddonGrid: React.FC<AddonGridProps> = ({ addons, selectedIds, onToggle }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {addons.map((addon) => {
                const isSelected = selectedIds.includes(addon.id);
                return (
                    <Card
                        key={addon.id}
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md border-2 relative",
                            isSelected ? "border-primary bg-primary/5" : "border-transparent"
                        )}
                        onClick={() => onToggle(addon.id)}
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2 z-10 text-primary">
                                <CheckCircle2 className="h-6 w-6 fill-background" />
                            </div>
                        )}
                        <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
                            <Image
                                src={addon.image}
                                alt={addon.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="p-3">
                            <h3 className="font-medium text-sm">{addon.name}</h3>
                            <p className="text-sm font-bold">+₹{addon.price}</p>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
