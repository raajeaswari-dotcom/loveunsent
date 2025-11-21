"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
    const { items, removeItem, addItem, total, isCartOpen, setIsCartOpen } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background h-full shadow-xl flex flex-col animate-in slide-in-from-right">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Shopping Cart</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <p>Your cart is empty</p>
                            <Button onClick={() => setIsCartOpen(false)}>Continue Shopping</Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                                <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                    Image
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">₹{item.price}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => removeItem(item.id)} // Simplified for now, ideally decrement
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => addItem({ ...item, quantity: 1 })}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-auto text-destructive"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t bg-muted/10 space-y-4">
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                        <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                            <Button className="w-full" size="lg">Checkout</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
