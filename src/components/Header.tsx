"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, User } from 'lucide-react';
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
                <div className="flex items-center justify-center mb-2">
                    {/* Logo Centered */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Love Unsent" className="h-4" />
                    </Link>
                </div>

                {/* Bottom Row: Navigation + Icons */}
                <div className="relative flex items-center justify-center min-h-[32px]">
                    {/* Centered Navigation */}
                    <nav className="hidden md:flex items-center justify-center gap-1">
                        <Link
                            href="/our-collection"
                            className={`px-4 py-1 text-xs font-medium tracking-wide rounded-t-[5px] transition-colors ${pathname === '/our-collection' || pathname === '/'
                                ? 'bg-mocha text-white'
                                : 'text-deep-brown hover:text-burgundy'
                                }`}
                        >
                            SHOP
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className={`px-3 py-1 text-xs font-medium tracking-wide rounded-t-[5px] transition-colors ${pathname === '/#how-it-works'
                                ? 'bg-mocha text-white'
                                : 'text-deep-brown hover:text-burgundy'
                                }`}
                        >
                            HOW IT WORKS
                        </Link>
                    </nav>

                    {/* Right Icons */}
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {!loading && (
                            <div className="hidden md:flex items-center gap-1">
                                {user ? (
                                    <Link href="/orders">
                                        <Button variant="ghost" size="icon" className="text-deep-brown hover:text-burgundy h-8 w-8">
                                            <span className="sr-only">Account</span>
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/login">
                                        <Button variant="ghost" size="icon" className="text-deep-brown hover:text-burgundy h-8 w-8">
                                            <span className="sr-only">Login</span>
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-deep-brown hover:text-burgundy h-8 w-8"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-burgundy text-white text-[8px] flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" className="md:hidden text-deep-brown h-8 w-8">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
