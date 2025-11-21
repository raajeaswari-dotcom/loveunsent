import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function OrderFailedPage() {
    return (
        <div className="container py-20 px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <div className="mb-6 text-destructive">
                <XCircle className="w-20 h-20 mx-auto" />
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4">Payment Failed</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                We were unable to process your payment. Please try again or contact support if the issue persists.
            </p>

            <div className="flex gap-4">
                <Link href="/checkout">
                    <Button>Try Again</Button>
                </Link>
                <Link href="/contact">
                    <Button variant="outline">Contact Support</Button>
                </Link>
            </div>
        </div>
    );
}
