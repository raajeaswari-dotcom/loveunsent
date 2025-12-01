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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

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
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="text-deep-brown hover:text-burgundy text-xs h-8 px-3 flex flex-col items-start leading-tight"
                                        >
                                            <span className="text-[10px] font-normal">Hello, {user.name?.split(' ')[0] || 'User'}</span>
                                            <span className="text-xs font-semibold">Account & Orders</span>
                                        </Button>

                                        {isUserMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                                                <Link
                                                    href="/dashboard?tab=orders"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    My Orders
                                                </Link>
                                                <Link
                                                    href="/dashboard?tab=profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    Profile & Addresses
                                                </Link>
                                                <div className="border-t border-gray-200 my-1"></div>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsUserMenuOpen(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link href="/auth">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-deep-brown hover:text-burgundy text-xs h-8 px-3 flex flex-col items-start leading-tight border border-gray-300 hover:border-gray-400 rounded-sm"
                                        >
                                            <span className="text-[10px] font-normal">Hello, sign in</span>
                                            <span className="text-xs font-semibold">Account & Lists</span>
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

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-deep-brown h-8 w-8"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-primary/5 py-4 px-4 shadow-lg flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link
                        href="/our-collection"
                        className="text-deep-brown hover:text-burgundy font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        SHOP
                    </Link>
                    <Link
                        href="/#how-it-works"
                        className="text-deep-brown hover:text-burgundy font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        HOW IT WORKS
                    </Link>
                    {!loading && (
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                            {user ? (
                                <>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md">
                                        <p className="text-xs text-gray-600">Hello, {user.name?.split(' ')[0] || 'User'}</p>
                                        <p className="text-sm font-semibold text-gray-900">Account & Orders</p>
                                    </div>
                                    <Link
                                        href="/dashboard?tab=orders"
                                        className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2 px-3 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                    <Link
                                        href="/dashboard?tab=profile"
                                        className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2 px-3 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile & Addresses
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2 px-3 py-2 text-left"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="px-3 py-3 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-300"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <p className="text-xs text-gray-600">Hello, sign in</p>
                                    <p className="text-sm font-semibold text-gray-900">Account & Lists</p>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};
