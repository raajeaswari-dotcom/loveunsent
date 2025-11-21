"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PenTool,
    DollarSign,
    User,
    LogOut,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/writer/dashboard' },
    { icon: FileText, label: 'My Tasks', href: '/writer/tasks' },
    { icon: DollarSign, label: 'Earnings', href: '/writer/earnings' },
    { icon: User, label: 'Profile', href: '/writer/profile' },
];

export default function WriterLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <PenTool className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-serif font-bold">Writer<span className="text-primary">.Portal</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 ${isActive ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
