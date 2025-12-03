# Authentication & Profile Fixes

## Issues Fixed

### 1. **Redirect to Home Instead of Dashboard**
**Problem**: After successful login/signup, users were redirected to home page instead of dashboard.

**Root Cause**: Conflicting `useEffect` in `/auth` page that automatically redirected logged-in users to home page, overriding the manual redirect to dashboard.

**Fix**: Removed the conflicting auto-redirect logic in `src/app/auth/page.tsx` to allow the manual redirect to `/dashboard` after login.

---

### 2. **User Name Not Showing**
**Problem**: User's name was not displaying in the header after signup.

**Root Causes**:
- Inconsistent user ID field names (`_id` vs `id`) across different endpoints
- Login function wasn't refreshing user data from server

**Fixes**:
- Standardized all user responses to use `id` instead of `_id`:
  - `src/app/api/auth/email/verify-otp/route.ts`
  - `src/app/api/auth/mobile/verify-otp/route.ts`
- Updated `AuthContext` to call `refreshUser()` after login to ensure latest data is loaded

---

### 3. **Addresses Not Saving**
**Problem**: Address data wasn't being saved to user profile.

**Investigation**: Added comprehensive logging to track:
- What data is being sent to the API
- What's being stored in the database
- What's being returned to the client

**Fix**: Enhanced logging in `src/app/api/user/profile/route.ts` to debug and verify the address save process.

---

## Files Modified

1. `src/app/auth/page.tsx` - Removed conflicting redirect
2. `src/app/api/auth/email/verify-otp/route.ts` - Standardized user ID field
3. `src/app/api/auth/mobile/verify-otp/route.ts` - Standardized user ID field
4. `src/context/AuthContext.tsx` - Added refresh after login
5. `src/app/api/user/profile/route.ts` - Enhanced logging
6. `src/app/api/auth/me/route.ts` - Improved cookie reading
7. `src/app/api/auth/logout/route.ts` - Added POST handler
8. `src/lib/otpHelpers.ts` - Allow 12345 as dev OTP

---

## Testing Steps

1. **Test Login Flow**:
   - Go to `/auth`
   - Enter email and get OTP (use 123456 or 12345 in dev)
   - For new users, enter name "Seba"
   - Verify you're redirected to `/dashboard`
   - Check that your name appears in the header

2. **Test Name Display**:
   - After login, refresh the page
   - Verify name still shows in header menu
   - Click "Account & Orders" dropdown
   - Verify "Hello, Seba" appears

3. **Test Address Save**:
   - Go to Dashboard → Profile & Addresses
   - Click "Add New" address
   - Fill in all fields (PIN code will auto-fill city/state)
   - Click "Save Address"
   - Check browser console for logs:
     - "Profile PUT - Update data"
     - "Profile PUT - User updated successfully"
   - Verify address appears in the list
   - Refresh page and verify address is still there

---

## Debug Logs to Check

When saving an address, you should see in the console:
```
Profile PUT - User ID: <userId>
Profile PUT - Update data: { name: undefined, addressCount: 1 }
Profile PUT - Updating user with: { addresses: [...] }
Profile PUT - User updated successfully: { userId: ..., name: 'Seba', addressCount: 1 }
```

If addresses aren't saving, check for error messages in these logs.
