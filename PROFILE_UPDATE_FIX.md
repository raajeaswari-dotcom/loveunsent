# Profile Update Fix - JWT Token Field Inconsistency

## Problem
After implementing the new authentication system, users who logged in via **mobile OTP** could not update their personal details. The error occurred because of an inconsistency in JWT token field names.

## Root Cause
There was a mismatch in the JWT token payload field names:

- **Email OTP Login**: Created JWT with `userId` field
- **Mobile OTP Login**: Created JWT with `id` field  
- **Profile API**: Expected `userId` field

This meant:
- ✅ Users who logged in via email could update their profile
- ❌ Users who logged in via mobile got "User not found" error

## Solution

### 1. Fixed Mobile OTP JWT Token
**File**: `src/app/api/auth/mobile/verify-otp/route.ts`

Changed from:
```typescript
const token = signJwt({
    id: user._id,  // ❌ Wrong field name
    role: user.role,
});
```

To:
```typescript
const token = signJwt({
    userId: user._id,  // ✅ Consistent with email auth
    role: user.role,
});
```

### 2. Enhanced Profile API for Backward Compatibility
**File**: `src/app/api/user/profile/route.ts`

Updated both GET and PUT endpoints to handle both field names:

```typescript
// Handle both 'userId' and 'id' field names for backward compatibility
const userId = decoded.userId || decoded.id;

if (!userId) {
    console.error('Profile - No user ID in token:', decoded);
    return errorResponse('Invalid token: missing user ID', 401);
}
```

This ensures:
- ✅ New logins (both email and mobile) use `userId`
- ✅ Old sessions with `id` field still work
- ✅ Better error logging for debugging

## Files Modified

1. **`src/app/api/auth/mobile/verify-otp/route.ts`**
   - Fixed JWT token to use `userId` instead of `id`

2. **`src/app/api/user/profile/route.ts`**
   - GET endpoint: Added backward compatibility for both field names
   - PUT endpoint: Added backward compatibility for both field names
   - Enhanced error logging

## Testing

### Test Case 1: Email Login + Profile Update
1. Login via email OTP
2. Go to Dashboard → Profile tab
3. Update name
4. **Expected**: ✅ Profile updates successfully

### Test Case 2: Mobile Login + Profile Update
1. Login via mobile OTP
2. Go to Dashboard → Profile tab
3. Update name
4. **Expected**: ✅ Profile updates successfully (previously failed)

### Test Case 3: Address Management
1. Login via either method
2. Go to Dashboard → Profile tab
3. Add new address
4. **Expected**: ✅ Address saves successfully

## Impact

- **Users Affected**: All users who logged in via mobile OTP
- **Severity**: High (blocked profile updates)
- **Status**: ✅ Fixed
- **Backward Compatibility**: ✅ Maintained for existing sessions

## Related Files

The following files already had the backward compatibility fix:
- `src/app/api/auth/me/route.ts` - Already using `decoded.userId || decoded.id`

## Prevention

To prevent similar issues in the future:
1. Always use consistent field names in JWT tokens across all auth methods
2. Add TypeScript interfaces for JWT payload
3. Create a centralized JWT creation helper
4. Add integration tests for all auth flows

## Recommendation

Consider creating a centralized JWT utility:

```typescript
// lib/jwt.ts
export interface JWTPayload {
  userId: string;
  role: string;
}

export function createAuthToken(userId: string, role: string): string {
  return signJwt({ userId, role });
}

export function getUserIdFromToken(decoded: any): string | null {
  return decoded.userId || decoded.id || null;
}
```

This would ensure consistency across all authentication endpoints.
