# OTP 6th Digit Missing - Quick Fix

## Problem
The 6th digit of the OTP is being cut off before sending to the server.

## Root Cause
React state update race condition - when you type the 6th digit, `handleVerifyOTP()` is called immediately, but the state hasn't updated yet, so it only sends 5 digits.

## Solution
We need to pass the OTP directly to the verify function instead of reading from state.

## Manual Fix Instructions

Edit `src/app/auth/page.tsx`:

### Change 1: Update handleVerifyOTP signature (line 133)
**Find:**
```typescript
const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const otpCode = otp.join("");
```

**Replace with:**
```typescript
const handleVerifyOTP = async (e?: React.FormEvent, otpOverride?: string) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const otpCode = otpOverride || otp.join("");
    console.log('🔐 [Frontend] Sending OTP:', otpCode);
```

### Change 2: Fix auto-submit (line 202)
**Find:**
```typescript
setTimeout(() => handleVerifyOTP(), 100);
```

**Replace with:**
```typescript
setTimeout(() => handleVerifyOTP(undefined, newOtp.join("")), 100);
```

### Change 3: Fix paste handler (line 222)
**Find:**
```typescript
setTimeout(() => handleVerifyOTP(), 100);
```

**Replace with:**
```typescript
setTimeout(() => handleVerifyOTP(undefined, pastedData), 100);
```

### Change 4: Fix response parsing (line 156)
**Find:**
```typescript
const data = await res.json();
```

**Replace with:**
```typescript
const response = await res.json();
console.log('📥 [Frontend] Response:', response);
const data = response.data || response;
```

## After Making Changes

1. Save the file
2. The dev server should auto-reload
3. Hard refresh your browser: `Ctrl + Shift + R`
4. Try the signup flow again
5. Check browser console (F12) - you should see: `🔐 [Frontend] Sending OTP: 123456`

## Test
1. Enter email
2. Enter OTP: 123456
3. Check terminal - should show: `Input: 123456` (not 12345)
4. Should work!
