"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { MapPin, Trash2 } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userAddresses, setUserAddresses] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<{ [key: string]: 'cod' | 'online' }>({});

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);

            // Initialize payment methods to COD by default
            const initialPaymentMethods: { [key: string]: 'cod' | 'online' } = {};
            parsedCart.forEach((item: any) => {
                initialPaymentMethods[item.id] = 'cod';
            });
            setPaymentMethods(initialPaymentMethods);
        }
        fetchAddresses();
        setLoading(false);
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await fetch('/api/user/addresses');
            if (response.ok) {
                const result = await response.json();
                setUserAddresses(result.data?.addresses || []);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const getAddressById = (addressId: string) => {
        return userAddresses.find(addr => addr._id === addressId);
    };

    const removeFromCart = (itemId: string) => {
        console.log('Removing item from cart:', itemId);
        const updatedCart = cart.filter(item => item.id !== itemId);
        console.log('Updated cart:', updatedCart);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handlePlaceOrder = async (item: any) => {
        const addressId = item.details?.recipientAddressId;

        if (!addressId) {
            alert('No delivery address found for this item. Please customize again.');
            return;
        }

        const address = getAddressById(addressId);

        if (!address) {
            alert('Delivery address not found. Please add the address in your profile.');
            return;
        }

        console.log('Selected address object:', address);

        // Validate address completeness
        if (!address.recipientName || !address.recipientPhone || !address.addressLine1 || !address.pincode) {
            alert('This delivery address is incomplete or uses an old format. Please go to your Profile, delete this address, and add it again.');
            return;
        }

        setIsProcessing(true);

        try {
            const paymentMethod = paymentMethods[item.id] || 'cod';

            const orderData = {
                items: [{
                    paperId: item.details?.paperId || 'ordinary',
                    handwritingStyleId: item.details?.handwritingStyleId || 'default',
                    perfumeId: item.details?.perfumeId,
                    addOns: item.details?.addonIds || [],
                    messageContent: item.details?.message,
                    wordCount: item.details?.wordCount,
                    inkColor: item.details?.inkColor
                }],
                paymentMethod: paymentMethod,
                shippingAddress: {
                    fullName: address.recipientName,
                    phone: address.recipientPhone,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2 || '',
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country || 'India'
                }
            };

            console.log('Sending order data:', orderData);

            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            console.log('Order response:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create order');
            }

            console.log('Order created:', result);

            // Remove this item from cart
            removeFromCart(item.id);

            if (paymentMethod === 'cod') {
                alert('Order placed successfully with Cash on Delivery! You can track your order in the dashboard.');
                router.push('/dashboard?tab=orders');
            } else {
                alert('Order placed successfully! Redirecting to payment...');
                // TODO: Integrate Razorpay payment here
                router.push('/dashboard?tab=orders');
            }
        } catch (error: any) {
            console.error('Order creation error:', error);
            alert(error.message || 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="container py-20 text-center">Loading...</div>;

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
        <div className="container max-w-6xl py-10 px-4">
            <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side - Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => {
                        const addressId = item.details?.recipientAddressId;
                        const address = addressId ? getAddressById(addressId) : null;

                        return (
                            <Card key={item.id} className="p-6">
                                <div className="flex gap-4">
                                    {/* Item Details */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {item.name || 'Custom Letter'}
                                                </h3>
                                                <p className="text-2xl font-bold text-[rgb(81,19,23)] mt-1">
                                                    ₹{item.price}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Message Preview */}
                                        {item.details?.message && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                                                <p className="text-sm text-gray-600 line-clamp-3">
                                                    {item.details.message}
                                                </p>
                                            </div>
                                        )}

                                        {/* Customization Details */}
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            {item.details?.paperId && (
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                                                    Paper: {item.details.paperId}
                                                </span>
                                            )}
                                            {item.details?.inkColor && (
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                                                    Ink: {item.details.inkColor}
                                                </span>
                                            )}
                                            {item.details?.addonIds?.length > 0 && (
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                                                    Add-ons: {item.details.addonIds.length}
                                                </span>
                                            )}
                                        </div>

                                        {/* Delivery Address */}
                                        <div className="border-t pt-3 mt-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Delivery Address:
                                            </p>
                                            {address ? (
                                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
                                                    <p className="font-semibold text-gray-900">{address.recipientName}</p>
                                                    <p className="text-gray-600">{address.recipientPhone}</p>
                                                    <p className="text-gray-700 mt-1">
                                                        {address.addressLine1}
                                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        {address.city}, {address.state} - {address.pincode}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
                                                    ⚠️ No delivery address found. Please customize this item again.
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Method Selection */}
                                        <div className="border-t pt-3 mt-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Payment Method:</p>
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={`payment-${item.id}`}
                                                        checked={(paymentMethods[item.id] || 'cod') === 'cod'}
                                                        onChange={() => setPaymentMethods({ ...paymentMethods, [item.id]: 'cod' })}
                                                        className="w-4 h-4 text-[rgb(81,19,23)] accent-[rgb(81,19,23)]"
                                                    />
                                                    <span className="text-sm font-medium">Cash on Delivery</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={`payment-${item.id}`}
                                                        checked={paymentMethods[item.id] === 'online'}
                                                        onChange={() => setPaymentMethods({ ...paymentMethods, [item.id]: 'online' })}
                                                        className="w-4 h-4 text-[rgb(81,19,23)] accent-[rgb(81,19,23)]"
                                                    />
                                                    <span className="text-sm font-medium">Online Payment</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Place Order Button */}
                                        <Button
                                            className="w-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] mt-3"
                                            size="lg"
                                            disabled={isProcessing || !address}
                                            onClick={() => handlePlaceOrder(item)}
                                        >
                                            {isProcessing ? 'Processing...' : ((paymentMethods[item.id] || 'cod') === 'cod' ? 'Place Order (COD)' : 'Pay Now')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Right Side - Cart Summary */}
                <div className="lg:col-span-1">
                    <Card className="p-6 bg-muted/30 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">Cart Summary</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Items ({cart.length})</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-[rgb(81,19,23)]">₹{total}</span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                <p className="font-medium text-blue-900 mb-1">ℹ️ How it works:</p>
                                <p>Each letter is a separate order. Click "Place Order & Pay" on each item to complete your purchase.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
