import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="border-t bg-[#2C1B13]">
            <div className="container py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-serif font-bold text-[#F3E9DD]">Love Unsent</h3>
                        <p className="text-sm text-[#F3E9DD]">
                            Bringing back the charm of handwritten letters in a digital world.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-[#F3E9DD]">Product</h4>
                        <ul className="space-y-2 text-sm text-[#F3E9DD]">
                            <li><Link href="/customize" className="hover:text-white transition-colors">Customize Letter</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Bulk Orders</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-[#F3E9DD]">Company</h4>
                        <ul className="space-y-2 text-sm text-[#F3E9DD]">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4 text-[#F3E9DD]">Connect</h4>
                        <ul className="space-y-2 text-sm text-[#F3E9DD]">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 border-t border-[#F3E9DD]/20 pt-6 text-center text-sm text-[#F3E9DD]">
                    © {new Date().getFullYear()} Love Unsent. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
