"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { MapPin, Trash2, Edit2, Package, FileText } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
    const router = useRouter();
    const { items: contextItems, removeItem: removeFromContext } = useCart();
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userAddresses, setUserAddresses] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<{ [key: string]: 'cod' | 'online' }>({});
    const [settings, setSettings] = useState<any>(null);

    // Product data for displaying names
    const [papers, setPapers] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [papersData, addonsData, settingsResponse] = await Promise.all([
                mockApi.getProducts(),
                mockApi.getAddons(),
                fetch('/api/system-settings').then(res => res.json())
            ]);
            setPapers(papersData);
            setAddons(addonsData);
            if (settingsResponse?.data?.settings) {
                setSettings(settingsResponse.data.settings);
            }
        };
        fetchData();

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

    const getPaperName = (paperId: string) => {
        const paper = papers.find(p => p.id === paperId);
        return paper?.name || paperId;
    };

    const getAddonDetails = (addonIds: string[]) => {
        if (!addonIds || addonIds.length === 0) return [];
        return addonIds.map(id => {
            const addon = addons.find(a => a.id === id);
            return addon || { id, name: id, price: 0 };
        });
    };

    const handleEditOrder = (item: any) => {
        // Store the item in localStorage for pre-filling
        localStorage.setItem('editingOrder', JSON.stringify(item));
        // Navigate to customize page with edit mode and orderId
        router.push(`/customize?edit=true&orderId=${item.id}`);
    };

    const removeFromCart = (itemId: string) => {
        console.log('Removing item from cart:', itemId);
        // Remove from context (which updates localStorage)
        removeFromContext(itemId);
        // Update local state
        const updatedCart = cart.filter(item => item.id !== itemId);
        setCart(updatedCart);
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
    const defaultPaymentMethod = settings?.paymentMethods?.cod ? 'cod' : (settings?.paymentMethods?.online ? 'online' : null);

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
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                    <p className="text-sm font-medium text-gray-700">Message:</p>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-3">
                                                    {item.details.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {item.details.wordCount || item.details.message.split(' ').length} words
                                                </p>
                                            </div>
                                        )}

                                        {/* Customization Details */}
                                        <div className="space-y-3">
                                            {/* Paper Type */}
                                            {item.details?.paperId && (
                                                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <Package className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-blue-900">Paper Type</p>
                                                        <p className="text-sm font-semibold text-blue-700">
                                                            {getPaperName(item.details.paperId)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Ink Color */}
                                            {item.details?.inkColor && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                                                    <div
                                                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                item.details.inkColor === 'Blue' ? '#1E3A8A' :
                                                                    item.details.inkColor === 'Black' ? '#000000' :
                                                                        item.details.inkColor === 'Red' ? '#DC2626' : '#1E3A8A'
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        <span className="font-medium">Ink:</span> {item.details.inkColor}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Add-ons */}
                                            {item.details?.addonIds && item.details.addonIds.length > 0 && (
                                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                    <p className="text-xs font-medium text-purple-900 mb-2">Add-ons ({item.details.addonIds.length})</p>
                                                    <div className="space-y-1">
                                                        {getAddonDetails(item.details.addonIds).map((addon, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                                <span className="text-purple-700">• {addon.name}</span>
                                                                <span className="text-purple-900 font-medium">₹{addon.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* No Add-ons */}
                                            {(!item.details?.addonIds || item.details.addonIds.length === 0) && (
                                                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                                                    <span className="text-sm text-gray-600">No add-ons selected</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit Order Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-2 border-[rgb(81,19,23)] text-[rgb(81,19,23)] hover:bg-[rgb(81,19,23)] hover:text-white"
                                            onClick={() => handleEditOrder(item)}
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit Order Details
                                        </Button>

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
                                                {settings?.paymentMethods?.cod && (
                                                    <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="radio"
                                                            name={`payment-${item.id}`}
                                                            checked={(paymentMethods[item.id] || defaultPaymentMethod) === 'cod'}
                                                            onChange={() => setPaymentMethods({ ...paymentMethods, [item.id]: 'cod' })}
                                                            className="w-4 h-4 text-[rgb(81,19,23)] accent-[rgb(81,19,23)]"
                                                        />
                                                        <span className="text-sm font-medium">Cash on Delivery</span>
                                                    </label>
                                                )}
                                                {settings?.paymentMethods?.online && (
                                                    <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="radio"
                                                            name={`payment-${item.id}`}
                                                            checked={paymentMethods[item.id] === 'online' || (!settings?.paymentMethods?.cod && defaultPaymentMethod === 'online')}
                                                            onChange={() => setPaymentMethods({ ...paymentMethods, [item.id]: 'online' })}
                                                            className="w-4 h-4 text-[rgb(81,19,23)] accent-[rgb(81,19,23)]"
                                                        />
                                                        <span className="text-sm font-medium">Online Payment</span>
                                                    </label>
                                                )}
                                                {!settings?.paymentMethods?.cod && !settings?.paymentMethods?.online && (
                                                    <p className="text-sm text-red-500">No payment methods available.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Place Order Button */}
                                        <Button
                                            className="w-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] mt-3"
                                            size="lg"
                                            disabled={isProcessing || !address || (!settings?.paymentMethods?.cod && !settings?.paymentMethods?.online)}
                                            onClick={() => handlePlaceOrder(item)}
                                        >
                                            {isProcessing ? 'Processing...' : (
                                                (paymentMethods[item.id] || defaultPaymentMethod) === 'cod' ? 'Place Order (COD)' : 'Pay Now'
                                            )}
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
