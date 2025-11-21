import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-serif font-bold">Love Unsent</h3>
                        <p className="text-sm text-muted-foreground">
                            Bringing back the charm of handwritten letters in a digital world.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/customize" className="hover:text-foreground transition-colors">Customize Letter</Link></li>
                            <li><Link href="/customize" className="hover:text-foreground transition-colors">Paper Types</Link></li>
                            <li><Link href="/customize" className="hover:text-foreground transition-colors">Perfumes</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors">Bulk Orders</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">How it Works</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Connect</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a></li>
                            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Facebook</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Love Unsent. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
