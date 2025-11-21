import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="container py-20 px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <div className="mb-6 text-green-500">
                <CheckCircle className="w-20 h-20 mx-auto" />
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Thank you for your order. We have received your request and will begin crafting your letter shortly. You will receive an email confirmation soon.
            </p>

            <div className="flex gap-4">
                <Link href="/orders">
                    <Button variant="outline">View My Orders</Button>
                </Link>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        </div>
    );
}
