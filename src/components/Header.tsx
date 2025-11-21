"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Header() {
    const { items, setIsCartOpen } = useCart();
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Hide header on dashboard routes
    if (pathname?.startsWith('/super-admin') || pathname?.startsWith('/writer') || pathname?.startsWith('/qc') || pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-serif text-2xl font-bold italic tracking-tighter">Love Unsent</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/customize" className="transition-colors hover:text-foreground/80 text-foreground/60">Customize</Link>
                        <Link href="/how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">How it Works</Link>
                        <Link href="/track" className="transition-colors hover:text-foreground/80 text-foreground/60">Track Order</Link>
                        <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About Us</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {!loading && (
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <>
                                    <span className="text-sm font-medium">Hi, {user.name.split(' ')[0]}</span>
                                    <Link href="/orders">
                                        <Button variant="ghost" size="sm">My Orders</Button>
                                    </Link>
                                    <Button variant="ghost" size="sm" onClick={() => logout()}>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm">Login</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button size="sm">Register</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="relative"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
