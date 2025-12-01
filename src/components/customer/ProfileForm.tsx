"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isValidPinCode, fetchPinCodeData, formatPinCode, debounce } from '@/lib/pinCodeValidator';

export default function ProfileForm() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [name, setName] = useState('');
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        isDefault: false
    });

    // PIN code validation states
    const [pinCodeStatus, setPinCodeStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [pinCodeMessage, setPinCodeMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                const data = await response.json();
                setName(data.user.name || '');
                setAddresses(data.user.addresses || []);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // PIN code validation and auto-fill
    const validatePinCode = useCallback(async (pincode: string) => {
        if (!pincode) {
            setPinCodeStatus('idle');
            setPinCodeMessage('');
            return;
        }

        if (!isValidPinCode(pincode)) {
            setPinCodeStatus('invalid');
            setPinCodeMessage('Please enter a valid 6-digit PIN code');
            return;
        }

        setPinCodeStatus('validating');
        setPinCodeMessage('Validating PIN code...');

        const data = await fetchPinCodeData(pincode);

        if (data) {
            setPinCodeStatus('valid');
            setPinCodeMessage(`${data.city}, ${data.state}`);

            // Auto-fill city and state
            setNewAddress(prev => ({
                ...prev,
                city: data.city,
                state: data.state,
                country: data.country
            }));
        } else {
            setPinCodeStatus('invalid');
            setPinCodeMessage('Invalid PIN code or service unavailable');
        }
    }, []);

    // Debounced PIN code validation
    const debouncedValidatePinCode = useCallback(
        debounce((pincode: string) => validatePinCode(pincode), 500),
        [validatePinCode]
    );

    const handlePinCodeChange = (value: string) => {
        const formatted = formatPinCode(value);
        setNewAddress({ ...newAddress, zip: formatted });

        if (formatted.length === 6) {
            debouncedValidatePinCode(formatted);
        } else {
            setPinCodeStatus('idle');
            setPinCodeMessage('');
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                refreshUser();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const updatedAddresses = [...addresses, newAddress];
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresses: updatedAddresses }),
            });

            const data = await response.json();

            if (response.ok) {
                setAddresses(data.user.addresses);
                setIsAddingAddress(false);
                setNewAddress({
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'India',
                    isDefault: false
                });
                setPinCodeStatus('idle');
                setPinCodeMessage('');
                setMessage({ type: 'success', text: 'Address added successfully' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to add address' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        setLoading(true);
        try {
            const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresses: updatedAddresses }),
            });

            if (response.ok) {
                const data = await response.json();
                setAddresses(data.user.addresses);
                setMessage({ type: 'success', text: 'Address deleted successfully' });
            } else {
                setMessage({ type: 'error', text: 'Failed to delete address' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Personal Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email || ''} disabled className="bg-muted" />
                        </div>
                        {user?.role === 'customer' && (
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={(user as any)?.phone || ''} disabled className="bg-muted" />
                            </div>
                        )}

                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Addresses</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(!isAddingAddress)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isAddingAddress && (
                        <form onSubmit={handleAddAddress} className="p-4 border rounded-lg bg-muted/20 space-y-4">
                            <h4 className="font-medium">New Address</h4>
                            <div className="grid gap-4">
                                {/* PIN Code - First field (Amazon style) */}
                                <div className="space-y-2">
                                    <Label htmlFor="zip">PIN Code</Label>
                                    <div className="relative">
                                        <Input
                                            id="zip"
                                            value={newAddress.zip}
                                            onChange={(e) => handlePinCodeChange(e.target.value)}
                                            placeholder="Enter 6-digit PIN code"
                                            maxLength={6}
                                            required
                                            className={`pr-10 ${pinCodeStatus === 'valid' ? 'border-green-500' :
                                                    pinCodeStatus === 'invalid' ? 'border-red-500' : ''
                                                }`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {pinCodeStatus === 'validating' && (
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            )}
                                            {pinCodeStatus === 'valid' && (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            )}
                                            {pinCodeStatus === 'invalid' && (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                    {pinCodeMessage && (
                                        <p className={`text-xs flex items-center gap-1 ${pinCodeStatus === 'valid' ? 'text-green-600' :
                                                pinCodeStatus === 'invalid' ? 'text-red-600' :
                                                    'text-blue-600'
                                            }`}>
                                            {pinCodeMessage}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        City and State will be auto-filled based on PIN code
                                    </p>
                                </div>

                                {/* Street Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="street">Flat, House no., Building, Company, Apartment</Label>
                                    <Input
                                        id="street"
                                        value={newAddress.street}
                                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                        placeholder="Enter your street address"
                                        required
                                    />
                                </div>

                                {/* City and State - Auto-filled */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                            placeholder="City"
                                            required
                                            className={pinCodeStatus === 'valid' ? 'bg-green-50' : ''}
                                        />
                                        {pinCodeStatus === 'valid' && (
                                            <p className="text-xs text-green-600">Auto-filled from PIN code</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                            placeholder="State"
                                            required
                                            className={pinCodeStatus === 'valid' ? 'bg-green-50' : ''}
                                        />
                                        {pinCodeStatus === 'valid' && (
                                            <p className="text-xs text-green-600">Auto-filled from PIN code</p>
                                        )}
                                    </div>
                                </div>

                                {/* Country - Read-only */}
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={newAddress.country}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="ghost" onClick={() => {
                                    setIsAddingAddress(false);
                                    setPinCodeStatus('idle');
                                    setPinCodeMessage('');
                                }}>Cancel</Button>
                                <Button
                                    type="submit"
                                    disabled={loading || pinCodeStatus === 'validating' || pinCodeStatus === 'invalid'}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Save Address
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="grid gap-4">
                        {addresses.map((addr: any, index) => (
                            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">{addr.street}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {addr.city}, {addr.state} {addr.zip}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{addr.country}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteAddress(addr._id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {addresses.length === 0 && !isAddingAddress && (
                            <p className="text-center text-muted-foreground py-4">No addresses saved yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {message && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
