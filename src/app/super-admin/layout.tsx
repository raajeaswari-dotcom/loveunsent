"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShieldAlert,
    Users,
    PenTool,
    ClipboardCheck,
    BarChart3,
    Settings,
    LogOut,
    Package,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/super-admin/dashboard' },
    { icon: Package, label: 'Orders', href: '/super-admin/orders' },
    { icon: ShieldAlert, label: 'Manage Admins', href: '/super-admin/admins' },
    { icon: PenTool, label: 'Manage Writers', href: '/super-admin/writers' },
    { icon: ClipboardCheck, label: 'Manage QC', href: '/super-admin/qc' },
    { icon: BarChart3, label: 'System Analytics', href: '/super-admin/analytics' },
];

const productSubItems = [
    { label: 'Papers', href: '/super-admin/products/papers' },
    { label: 'Add-ons', href: '/super-admin/products/addons' },
    { label: 'Our Collection', href: '/super-admin/products/collection' },
];

const settingsSubItems = [
    { label: 'Shipping Rates', href: '/super-admin/settings/shipping' },
    { label: 'Tax Configuration', href: '/super-admin/settings/tax' },
    { label: 'System Settings', href: '/super-admin/settings' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [productsExpanded, setProductsExpanded] = useState(
        pathname.includes('/super-admin/products')
    );
    const [settingsExpanded, setSettingsExpanded] = useState(
        pathname.includes('/super-admin/settings')
    );
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-zinc-900 text-white p-4 md:hidden w-full">
                <button onClick={() => setMobileMenuOpen(true)} className="text-white p-2">
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-serif font-bold">
                    Super<span className="text-purple-400">.Admin</span>
                </h1>
            </header>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <aside className="fixed inset-y-0 left-0 w-64 bg-zinc-900 text-white transform translate-x-0 transition-transform duration-300 ease-in-out md:hidden z-30">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Menu</h2>
                        <Button variant="ghost" onClick={() => setMobileMenuOpen(false)} className="text-white">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <nav className="p-4 space-y-2 overflow-y-auto">
                        {sidebarItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start gap-3 ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                        {/* Products Section */}
                        <div className="pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setProductsExpanded(!productsExpanded)}
                                className={`w-full justify-start gap-3 ${pathname.includes('/super-admin/products')
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400'
                                    }`}
                            >
                                <Package className="w-4 h-4" />
                                Products
                                {productsExpanded ? (
                                    <ChevronDown className="w-4 h-4 ml-auto" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </Button>
                            {productsExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {productSubItems.map((subItem) => {
                                        const isActive = pathname === subItem.href;
                                        return (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className={`w-full justify-start gap-3 text-sm ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                                                        }`}
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    </div>
                                                    {subItem.label}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {/* Settings Section */}
                        <div className="pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setSettingsExpanded(!settingsExpanded)}
                                className={`w-full justify-start gap-3 ${pathname.includes('/super-admin/settings')
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400'
                                    }`}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                                {settingsExpanded ? (
                                    <ChevronDown className="w-4 h-4 ml-auto" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </Button>
                            {settingsExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {settingsSubItems.map((subItem) => {
                                        const isActive = pathname === subItem.href;
                                        return (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className={`w-full justify-start gap-3 text-sm ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                                                        }`}
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    </div>
                                                    {subItem.label}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-400 hover:text-red-300"
                            onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                            }}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </nav>
                </aside>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-full">
                        <ShieldAlert className="w-5 h-5 text-purple-400" />
                    </div>
                    <h1 className="text-xl font-serif font-bold">
                        Super<span className="text-purple-400">.Admin</span>
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start gap-3 hover:bg-zinc-800 hover:text-white ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                    {/* Products Section */}
                    <div className="pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setProductsExpanded(!productsExpanded)}
                            className={`w-full justify-start gap-3 hover:bg-zinc-800 hover:text-white ${pathname.includes('/super-admin/products')
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            Products
                            {productsExpanded ? (
                                <ChevronDown className="w-4 h-4 ml-auto" />
                            ) : (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                        </Button>
                        {productsExpanded && (
                            <div className="ml-4 mt-1 space-y-1">
                                {productSubItems.map((subItem) => {
                                    const isActive = pathname === subItem.href;
                                    return (
                                        <Link key={subItem.href} href={subItem.href}>
                                            <Button
                                                variant="ghost"
                                                className={`w-full justify-start gap-3 text-sm hover:bg-zinc-800 hover:text-white ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                                                    }`}
                                            >
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                </div>
                                                {subItem.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Settings Section */}
                    <div className="pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setSettingsExpanded(!settingsExpanded)}
                            className={`w-full justify-start gap-3 hover:bg-zinc-800 hover:text-white ${pathname.includes('/super-admin/settings')
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                            {settingsExpanded ? (
                                <ChevronDown className="w-4 h-4 ml-auto" />
                            ) : (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                        </Button>
                        {settingsExpanded && (
                            <div className="ml-4 mt-1 space-y-1">
                                {settingsSubItems.map((subItem) => {
                                    const isActive = pathname === subItem.href;
                                    return (
                                        <Link key={subItem.href} href={subItem.href}>
                                            <Button
                                                variant="ghost"
                                                className={`w-full justify-start gap-3 text-sm hover:bg-zinc-800 hover:text-white ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                                                    }`}
                                            >
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                </div>
                                                {subItem.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
