// Simple toast hook implementation
import { useCallback } from 'react';

interface ToastOptions {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | string;
}

/**
 * Minimal useToast hook compatible with shadcn/ui API.
 * It simply logs the toast to the console and shows an alert for destructive toasts.
 */
export function useToast() {
    const toast = useCallback((options: ToastOptions) => {
        const { title, description, variant } = options;
        const message = description ? `${title}: ${description}` : title;
        if (variant === 'destructive') {
            // For destructive toasts, use console.error and alert for visibility
            console.error('Destructive toast:', message);
            if (typeof window !== 'undefined') {
                alert(`Error: ${message}`);
            }
        } else {
            console.log('Toast:', message);
        }
    }, []);

    return { toast };
}
