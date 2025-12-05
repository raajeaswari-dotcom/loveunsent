"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Edit2, MapPin, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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

export default function ProfileForm() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [name, setName] = useState('');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    // Optional personal information
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('en');
    const [alternatePhone, setAlternatePhone] = useState('');

    // Contact update states
    const [isUpdatingContact, setIsUpdatingContact] = useState(false);
    const [contactUpdateType, setContactUpdateType] = useState<'email' | 'mobile' | null>(null);
    const [contactValue, setContactValue] = useState('');
    const [contactOTP, setContactOTP] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

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

    useEffect(() => {
        fetchProfile();
    }, []);

    // OTP timer countdown
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                const result = await response.json();
                const data = result.data || result;
                setName(data.user?.name || '');
                setAddresses(data.user?.addresses || []);

                // Load optional personal information
                setDateOfBirth(data.user?.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : '');
                setGender(data.user?.gender || '');
                setPreferredLanguage(data.user?.preferredLanguage || 'en');
                setAlternatePhone(data.user?.alternatePhone || '');
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
        setNewAddress({ ...newAddress, pincode: formatted });

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
                body: JSON.stringify({
                    name,
                    dateOfBirth: dateOfBirth || null,
                    gender: gender || null,
                    preferredLanguage,
                    alternatePhone: alternatePhone || null,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                refreshUser();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
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
            const response = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress),
            });

            const result = await response.json();

            if (response.ok) {
                setAddresses(result.data?.addresses || []);
                setIsAddingAddress(false);
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
                setMessage({ type: 'success', text: 'Address added successfully' });
                setTimeout(() => fetchProfile(), 500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to add address' });
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
            const response = await fetch(`/api/user/addresses?addressId=${addressId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (response.ok) {
                setAddresses(result.data?.addresses || []);
                setMessage({ type: 'success', text: 'Address deleted successfully' });
                setTimeout(() => fetchProfile(), 500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to delete address' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddressId(address._id || null);
        setNewAddress({
            recipientName: address.recipientName,
            recipientPhone: address.recipientPhone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            isDefault: address.isDefault || false
        });
        setIsAddingAddress(true);
        setPinCodeStatus('valid');
        setPinCodeMessage(`${address.city}, ${address.state}`);
    };

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/user/addresses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId: editingAddressId,
                    ...newAddress
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setAddresses(result.data?.addresses || []);
                resetAddressForm();
                setMessage({ type: 'success', text: 'Address updated successfully' });
                setTimeout(() => fetchProfile(), 500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update address' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const resetAddressForm = () => {
        setIsAddingAddress(false);
        setEditingAddressId(null);
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
    };

    // Contact update functions
    const handleStartContactUpdate = (type: 'email' | 'mobile') => {
        setContactUpdateType(type);
        setContactValue('');
        setContactOTP('');
        setOtpSent(false);
        setIsUpdatingContact(true);
    };

    const handleSendContactOTP = async () => {
        if (!contactValue.trim()) {
            setMessage({ type: 'error', text: `Please enter ${contactUpdateType}` });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/user/update-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: contactUpdateType,
                    value: contactValue
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setOtpSent(true);
                setOtpTimer(60);
                setMessage({ type: 'success', text: result.message });
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to send OTP' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyContactOTP = async () => {
        if (!contactOTP.trim()) {
            setMessage({ type: 'error', text: 'Please enter OTP' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/user/update-contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: contactUpdateType,
                    value: contactValue,
                    otp: contactOTP
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: result.message });
                setIsUpdatingContact(false);
                setContactUpdateType(null);
                setContactValue('');
                setContactOTP('');
                setOtpSent(false);
                refreshUser();
                setTimeout(() => fetchProfile(), 500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to verify OTP' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelContactUpdate = () => {
        setIsUpdatingContact(false);
        setContactUpdateType(null);
        setContactValue('');
        setContactOTP('');
        setOtpSent(false);
        setOtpTimer(0);
    };

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            {/* Email Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Email</Label>
                                    {user?.email && user?.emailVerified && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                {!isUpdatingContact || contactUpdateType !== 'email' ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={user?.email || 'Not provided'}
                                            disabled
                                            className="bg-gray-100 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStartContactUpdate('email')}
                                        >
                                            {user?.email ? 'Change' : 'Add'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                        <div className="space-y-2">
                                            <Label htmlFor="newEmail">New Email Address</Label>
                                            <Input
                                                id="newEmail"
                                                type="email"
                                                value={contactValue}
                                                onChange={(e) => setContactValue(e.target.value)}
                                                placeholder="Enter your email"
                                                disabled={otpSent}
                                            />
                                        </div>

                                        {!otpSent ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleSendContactOTP}
                                                    disabled={loading}
                                                    className="bg-[rgb(81,19,23)] hover:bg-[#4A2424]"
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    Send OTP
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleCancelContactUpdate}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="emailOTP">Enter OTP</Label>
                                                    <Input
                                                        id="emailOTP"
                                                        value={contactOTP}
                                                        onChange={(e) => setContactOTP(e.target.value)}
                                                        placeholder="Enter 6-digit OTP"
                                                        maxLength={6}
                                                    />
                                                    {otpTimer > 0 && (
                                                        <p className="text-xs text-gray-600">
                                                            Resend OTP in {otpTimer}s
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleVerifyContactOTP}
                                                        disabled={loading}
                                                        className="bg-[rgb(81,19,23)] hover:bg-[#4A2424]"
                                                    >
                                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        Verify & Update
                                                    </Button>
                                                    {otpTimer === 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleSendContactOTP}
                                                            disabled={loading}
                                                        >
                                                            Resend OTP
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={handleCancelContactUpdate}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Phone Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Phone</Label>
                                    {user?.phone && user?.phoneVerified && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                {!isUpdatingContact || contactUpdateType !== 'mobile' ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={user?.phone || 'Not provided'}
                                            disabled
                                            className="bg-gray-100 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStartContactUpdate('mobile')}
                                        >
                                            {user?.phone ? 'Change' : 'Add'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPhone">New Mobile Number</Label>
                                            <Input
                                                id="newPhone"
                                                type="tel"
                                                value={contactValue}
                                                onChange={(e) => setContactValue(e.target.value)}
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength={10}
                                                disabled={otpSent}
                                            />
                                        </div>

                                        {!otpSent ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleSendContactOTP}
                                                    disabled={loading}
                                                    className="bg-[rgb(81,19,23)] hover:bg-[#4A2424]"
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    Send OTP
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleCancelContactUpdate}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phoneOTP">Enter OTP</Label>
                                                    <Input
                                                        id="phoneOTP"
                                                        value={contactOTP}
                                                        onChange={(e) => setContactOTP(e.target.value)}
                                                        placeholder="Enter 6-digit OTP"
                                                        maxLength={6}
                                                    />
                                                    {otpTimer > 0 && (
                                                        <p className="text-xs text-gray-600">
                                                            Resend OTP in {otpTimer}s
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleVerifyContactOTP}
                                                        disabled={loading}
                                                        className="bg-[rgb(81,19,23)] hover:bg-[#4A2424]"
                                                    >
                                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        Verify & Update
                                                    </Button>
                                                    {otpTimer === 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleSendContactOTP}
                                                            disabled={loading}
                                                        >
                                                            Resend OTP
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={handleCancelContactUpdate}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Optional Personal Information Section */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                Additional Information (Optional)
                            </h3>
                            <div className="grid gap-4">
                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="text-xs text-gray-500">
                                        We'll send you special birthday offers!
                                    </p>
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <select
                                        id="gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Preferred Language */}
                                <div className="space-y-2">
                                    <Label htmlFor="language">Preferred Language</Label>
                                    <select
                                        id="language"
                                        value={preferredLanguage}
                                        onChange={(e) => setPreferredLanguage(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                        <option value="ta">Tamil</option>
                                        <option value="te">Telugu</option>
                                        <option value="kn">Kannada</option>
                                        <option value="ml">Malayalam</option>
                                        <option value="bn">Bengali</option>
                                        <option value="gu">Gujarati</option>
                                        <option value="pa">Punjabi</option>
                                    </select>
                                    <p className="text-xs text-gray-500">
                                        Helps us communicate better with you
                                    </p>
                                </div>

                                {/* Alternate Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
                                    <Input
                                        id="alternatePhone"
                                        type="tel"
                                        value={alternatePhone}
                                        onChange={(e) => setAlternatePhone(e.target.value)}
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Backup contact for delivery coordination
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading || isUpdatingContact}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Delivery Addresses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[rgb(81,19,23)]" />
                        <CardTitle>Delivery Addresses</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(!isAddingAddress)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-gray-600">
                        Save recipient addresses here. You can select them when customizing letters.
                    </p>

                    {isAddingAddress && (
                        <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="p-4 border-2 rounded-lg bg-muted/20 space-y-4">
                            <h4 className="font-medium">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
                            <div className="grid gap-4">
                                {/* Recipient Name and Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <Button type="button" variant="ghost" onClick={resetAddressForm}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || pinCodeStatus === 'validating' || pinCodeStatus === 'invalid'}
                                        className="bg-[rgb(81,19,23)] hover:bg-[#4A2424]"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {editingAddressId ? 'Update Address' : 'Save Address'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="grid gap-4">
                        {addresses.map((addr: Address) => (
                            <div key={addr._id} className="flex items-start justify-between p-4 border rounded-lg hover:border-gray-300 transition-colors">
                                <div className="flex gap-3 flex-1">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{addr.recipientName}</p>
                                        <p className="text-sm text-gray-600">{addr.recipientPhone}</p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            {addr.addressLine1}
                                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                                        </p>
                                        {addr.landmark && (
                                            <p className="text-sm text-gray-600">Landmark: {addr.landmark}</p>
                                        )}
                                        <p className="text-sm text-gray-700">
                                            {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                        <p className="text-sm text-gray-600">{addr.country}</p>
                                        {addr.isDefault && (
                                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-[rgb(81,19,23)] text-white rounded">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => handleEditAddress(addr)}
                                        title="Edit Address"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteAddress(addr._id!)}
                                        title="Delete Address"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
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
