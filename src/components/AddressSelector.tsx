"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { isValidPinCode, fetchPinCodeData, formatPinCode, debounce } from '@/lib/pinCodeValidator';

interface Address {
    _id?: string;
    recipientName: string;
    recipientPhone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault?: boolean;
}

interface AddressSelectorProps {
    selectedAddressId: string | null;
    onSelectAddress: (addressId: string | null) => void;
    userAddresses: Address[];
    onAddressesChange?: () => void; // Callback to refresh addresses
}

export function AddressSelector({
    selectedAddressId,
    onSelectAddress,
    userAddresses,
    onAddressesChange
}: AddressSelectorProps) {
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [newAddress, setNewAddress] = useState<Address>({
        recipientName: '',
        recipientPhone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
    });

    // PIN code validation states
    const [pinCodeStatus, setPinCodeStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [pinCodeMessage, setPinCodeMessage] = useState('');

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
        setNewAddress({ ...newAddress, pincode: formatted });

        if (formatted.length === 6) {
            debouncedValidatePinCode(formatted);
        } else {
            setPinCodeStatus('idle');
            setPinCodeMessage('');
        }
    };

    const handleSaveNewAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        console.log('Sending address data to API:', newAddress);

        try {
            const response = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Address saved successfully' });
                setShowNewAddressForm(false);
                setNewAddress({
                    recipientName: '',
                    recipientPhone: '',
                    addressLine1: '',
                    addressLine2: '',
                    landmark: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    isDefault: false
                });
                setPinCodeStatus('idle');
                setPinCodeMessage('');

                // Select the newly added address
                if (result.data?.addressId) {
                    onSelectAddress(result.data.addressId);
                }

                // Refresh addresses list
                if (onAddressesChange) {
                    onAddressesChange();
                }
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save address' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Recipient Address</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {showNewAddressForm ? 'Cancel' : 'Add New Address'}
                </Button>
            </div>

            {/* Saved Addresses */}
            {!showNewAddressForm && userAddresses.length > 0 && (
                <div className="space-y-3">
                    {userAddresses.map((address) => (
                        <Card
                            key={address._id}
                            className={`p-4 cursor-pointer transition-all ${selectedAddressId === address._id
                                ? 'border-2 border-[rgb(81,19,23)] bg-[rgb(81,19,23)]/5'
                                : 'border hover:border-gray-400'
                                }`}
                            onClick={() => onSelectAddress(address._id || null)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address._id
                                    ? 'border-[rgb(81,19,23)] bg-[rgb(81,19,23)]'
                                    : 'border-gray-300'
                                    }`}>
                                    {selectedAddressId === address._id && (
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{address.recipientName}</p>
                                    <p className="text-sm text-gray-600">{address.recipientPhone}</p>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    {address.landmark && (
                                        <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                                    )}
                                    <p className="text-sm text-gray-700">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    <p className="text-sm text-gray-600">{address.country}</p>
                                    {address.isDefault && (
                                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-[rgb(81,19,23)] text-white rounded">
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* No addresses message */}
            {!showNewAddressForm && userAddresses.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No saved addresses</p>
                    <p className="text-sm text-gray-500">Add a new address to continue</p>
                </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
                <form onSubmit={handleSaveNewAddress} className="p-4 border-2 rounded-lg bg-gray-50 space-y-4">
                    <h4 className="font-semibold text-gray-900">New Recipient Address</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recipient Name */}
                        <div className="space-y-2">
                            <Label htmlFor="recipientName">Recipient Name *</Label>
                            <Input
                                id="recipientName"
                                value={newAddress.recipientName}
                                onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                                placeholder="Full name"
                                required
                            />
                        </div>

                        {/* Recipient Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="recipientPhone">Recipient Phone *</Label>
                            <Input
                                id="recipientPhone"
                                type="tel"
                                value={newAddress.recipientPhone}
                                onChange={(e) => setNewAddress({ ...newAddress, recipientPhone: e.target.value })}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                required
                            />
                        </div>
                    </div>

                    {/* PIN Code - First for auto-fill */}
                    <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <div className="relative">
                            <Input
                                id="pincode"
                                value={newAddress.pincode}
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
                            <p className={`text-xs ${pinCodeStatus === 'valid' ? 'text-green-600' :
                                pinCodeStatus === 'invalid' ? 'text-red-600' :
                                    'text-blue-600'
                                }`}>
                                {pinCodeMessage}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">City and State will be auto-filled</p>
                    </div>

                    {/* Address Line 1 */}
                    <div className="space-y-2">
                        <Label htmlFor="addressLine1">Flat, House no., Building, Company, Apartment *</Label>
                        <Input
                            id="addressLine1"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                            placeholder="Enter address line 1"
                            required
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div className="space-y-2">
                        <Label htmlFor="addressLine2">Area, Street, Sector, Village (Optional)</Label>
                        <Input
                            id="addressLine2"
                            value={newAddress.addressLine2}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                            placeholder="Enter address line 2"
                        />
                    </div>

                    {/* Landmark */}
                    <div className="space-y-2">
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <Input
                            id="landmark"
                            value={newAddress.landmark}
                            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                            placeholder="E.g., Near City Mall"
                        />
                    </div>

                    {/* City and State - Auto-filled */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
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
                            <Label htmlFor="state">State *</Label>
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
                            className="bg-gray-100"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowNewAddressForm(false);
                                setPinCodeStatus('idle');
                                setPinCodeMessage('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || pinCodeStatus === 'validating' || pinCodeStatus === 'invalid'}
                            className="bg-[rgb(81,19,23)] hover:bg-[#4A2424]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Address
                        </Button>
                    </div>
                </form>
            )}

            {/* Success/Error Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
