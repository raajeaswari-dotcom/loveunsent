"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type CustomizationState = {
    message: string;
    paperId: string | null;
    handwritingId: string | null;
    perfumeId: string | null;
    addonIds: string[];
    deliveryDate: string | null;
    inputMethod: 'text' | 'voice' | 'image';
    handwritingImageUrl: string | null;
    recipientAddressId: string | null; // ID of saved address from user's addresses
};

type CustomizationContextType = {
    state: CustomizationState;
    updateState: (updates: Partial<CustomizationState>) => void;
    resetState: () => void;
    canProceed: (step: number) => boolean;
};

const initialState: CustomizationState = {
    message: '',
    paperId: null,
    handwritingId: null,
    perfumeId: null,
    addonIds: [],
    deliveryDate: null,
    inputMethod: 'text',
    handwritingImageUrl: null,
    recipientAddressId: null,
};

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<CustomizationState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('customization_state');
        if (savedState) {
            try {
                setState(JSON.parse(savedState));
            } catch (e) {
                console.error('Failed to parse customization state', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('customization_state', JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const updateState = (updates: Partial<CustomizationState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const resetState = () => {
        setState(initialState);
        localStorage.removeItem('customization_state');
    };

    const canProceed = (step: number) => {
        // Step indices based on the wizard flow: 
        // 0: Message, 1: Paper, 2: Ink Color, 3: Word Count, 4: Recipient Details, 5: Add-ons, 6: Review
        switch (step) {
            case 0:
                if (state.inputMethod === 'image') {
                    return !!state.handwritingImageUrl;
                }
                return state.message.length > 0;
            case 1: return !!state.paperId;
            case 2: return true; // Ink color is always selectable
            case 3: return true; // Recipient details validation handled in page
            case 4: return true; // Add-ons optional
            case 5: return true; // Review
            default: return true;
        }
    };

    return (
        <CustomizationContext.Provider value={{ state, updateState, resetState, canProceed }}>
            {children}
        </CustomizationContext.Provider>
    );
}

export function useCustomization() {
    const context = useContext(CustomizationContext);
    if (context === undefined) {
        throw new Error('useCustomization must be used within a CustomizationProvider');
    }
    return context;
}
