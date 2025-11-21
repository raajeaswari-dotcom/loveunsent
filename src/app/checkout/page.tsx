"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockApi } from '@/lib/mockApi';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        setLoading(false);
    }, []);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Pincode Lookup Logic
        if (name === 'zip' && value.length === 6) {
            setIsCheckingPincode(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await res.json();

                if (data[0].Status === 'Success') {
                    const details = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        city: details.District,
                        state: details.State,
                        zip: value
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch pincode details", error);
            } finally {
                setIsCheckingPincode(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const order = await mockApi.createOrder({
            customer: formData,
            items: cart,
            total: cart.reduce((acc, item) => acc + item.price, 0)
        });

        console.log('Order placed:', order);
        localStorage.removeItem('cart');
        alert('Order placed successfully! (Mock)');
        router.push('/');
    };

    if (loading) return <div>Loading...</div>;

    if (cart.length === 0) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Button onClick={() => router.push('/customize')}>Start Customizing</Button>
            </div>
        );
    }

    const total = cart.reduce((acc, item) => acc + item.price, 0);

    return (
        <div className="container max-w-4xl py-10 px-4">
            <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Form */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input required name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input required name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input required name="city" value={formData.city} onChange={handleInputChange} placeholder="New York" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">State</label>
                                    <Input required name="state" value={formData.state} onChange={handleInputChange} placeholder="NY" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ZIP / Pincode</label>
                                <div className="relative">
                                    <Input
                                        required
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        placeholder="110001"
                                        maxLength={6}
                                    />
                                    {isCheckingPincode && (
                                        <span className="absolute right-3 top-2 text-xs text-muted-foreground animate-pulse">
                                            Checking...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    <Card className="p-6 bg-muted/30">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm border-b pb-2">
                                    <div>
                                        <p className="font-medium">Custom Letter</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.message}</p>
                                    </div>
                                    <span className="font-medium">₹{item.price}</span>
                                </div>
                            ))}

                            <div className="flex justify-between pt-2">
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between border-t pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            form="checkout-form"
                            className="w-full mt-6"
                            size="lg"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </Button>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                            Secure payment via Razorpay (Mock)
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
