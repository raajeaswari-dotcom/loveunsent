import { useMemo } from 'react';
import { useCustomization } from '@/context/CustomizationContext';
import { mockPapers, mockPerfumes, mockHandwritings, mockAddons } from '@/lib/mockApi';

export function usePrice() {
    const { state } = useCustomization();

    const priceBreakdown = useMemo(() => {
        let total = 0;
        const breakdown = [];

        // Base Letter Price (Paper)
        if (state.paperId) {
            const paper = mockPapers.find(p => p.id === state.paperId);
            if (paper) {
                total += paper.price;
                breakdown.push({ name: `Paper: ${paper.name}`, price: paper.price });
            }
        }

        // Handwriting Style (Usually free, but could have premium styles)
        if (state.handwritingId) {
            const style = mockHandwritings.find(h => h.id === state.handwritingId);
            if (style) {
                // Assuming handwriting style might have a price in the future, currently 0 in mock
                // total += style.price || 0;
                // breakdown.push({ name: `Style: ${style.name}`, price: style.price || 0 });
            }
        }

        // Perfume
        if (state.perfumeId) {
            const perfume = mockPerfumes.find(p => p.id === state.perfumeId);
            if (perfume) {
                total += perfume.price;
                breakdown.push({ name: `Scent: ${perfume.name}`, price: perfume.price });
            }
        }

        // Add-ons
        if (state.addonIds.length > 0) {
            state.addonIds.forEach(id => {
                const addon = mockAddons.find(a => a.id === id);
                if (addon) {
                    total += addon.price;
                    breakdown.push({ name: `Add-on: ${addon.name}`, price: addon.price });
                }
            });
        }

        return { total, breakdown };
    }, [state]);

    return priceBreakdown;
}
