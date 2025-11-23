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
        <header className="sticky top-0 z-50 w-full bg-cream border-b border-primary/5">
            <div className="container pt-4 pb-0">
                <div className="relative flex items-center justify-center mb-4">
                    {/* Logo Centered */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-display text-3xl font-bold text-deep-brown tracking-tight">Love Unsent</span>
                    </Link>

                    {/* Right Icons */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                        {!loading && (
                            <div className="hidden md:flex items-center gap-4">
                                {user ? (
                                    <Link href="/orders">
                                        <Button variant="ghost" size="icon" className="text-deep-brown hover:text-burgundy">
                                            <span className="sr-only">Account</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/login">
                                        <Button variant="ghost" size="icon" className="text-deep-brown hover:text-burgundy">
                                            <span className="sr-only">Login</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-deep-brown hover:text-burgundy"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-burgundy text-white text-[10px] flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" className="md:hidden text-deep-brown">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Centered Navigation */}
                <nav className="hidden md:flex items-center justify-center gap-1">
                    <Link
                        href="/our-collection"
                        className={`px-8 py-2 text-sm font-bold tracking-wide rounded-t-lg transition-colors ${pathname === '/our-collection' || pathname === '/'
                            ? 'bg-mocha text-white'
                            : 'text-deep-brown hover:text-burgundy'
                            }`}
                    >
                        SHOP
                    </Link>
                    <Link
                        href="/how-it-works"
                        className={`px-6 py-2 text-sm font-bold tracking-wide rounded-t-lg transition-colors ${pathname === '/how-it-works'
                            ? 'bg-mocha text-white'
                            : 'text-deep-brown hover:text-burgundy'
                            }`}
                    >
                        HOW IT WORKS
                    </Link>
                </nav>
            </div>
        </header>
    );
};
