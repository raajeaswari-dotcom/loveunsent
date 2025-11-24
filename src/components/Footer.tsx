import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-serif font-bold text-[#2C1B13]">Love Unsent</h3>
                        <p className="text-sm text-[#2C1B13]">
                            Bringing back the charm of handwritten letters in a digital world.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-[#2C1B13]">Product</h4>
                        <ul className="space-y-2 text-sm text-[#2C1B13]">
                            <li><Link href="/customize" className="hover:text-[#2C1B13] transition-colors">Customize Letter</Link></li>
                            <li><Link href="/contact" className="hover:text-[#2C1B13] transition-colors">Bulk Orders</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-[#2C1B13]">Company</h4>
                        <ul className="space-y-2 text-sm text-[#2C1B13]">
                            <li><Link href="/about" className="hover:text-[#2C1B13] transition-colors">About Us</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-[#2C1B13] transition-colors">How it Works</Link></li>
                            <li><Link href="/contact" className="hover:text-[#2C1B13] transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-[#2C1B13] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-[#2C1B13] transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-[#2C1B13]">Connect</h4>
                        <ul className="space-y-2 text-sm text-[#2C1B13]">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C1B13] transition-colors">Instagram</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C1B13] transition-colors">Twitter</a></li>
                            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2C1B13] transition-colors">Facebook</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 border-t pt-6 text-center text-sm text-[#2C1B13]">
                    © {new Date().getFullYear()} Love Unsent. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
