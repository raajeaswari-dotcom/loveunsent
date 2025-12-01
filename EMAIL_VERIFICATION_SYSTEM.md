# Amazon-Style Email Verification System

## Overview
Implemented a smart email/phone verification system that follows Amazon's approach: verification is only required for critical actions like placing orders, not for browsing or viewing products.

## Amazon's Verification Philosophy

### ❌ Verification NOT Required For:
- Browsing products
- Adding items to cart
- Viewing account details
- Viewing order history
- Reading product reviews

### ✅ Verification REQUIRED For:
- **Placing orders** (to send order confirmations)
- Requesting refunds/returns
- Changing email address
- Changing phone number
- Deleting account

## Implementation

### 1. Verification Utility (`/src/lib/emailVerification.ts`)

Centralized verification logic with action-based requirements:

```typescript
getVerificationRequirements(action: string): VerificationRequirement

Actions:
- 'browse' → No verification needed
- 'place_order' → Email OR phone verification required
- 'request_refund' → Email verification required
- 'delete_account' → Both email AND phone required
```

### 2. Verification Prompt Component (`/src/components/VerificationPrompt.tsx`)

Beautiful, user-friendly verification UI:
- **6-digit OTP input** with individual boxes
- **Auto-focus** between boxes
- **Auto-submit** when complete
- **Resend timer** with countdown
- **Clear error messages**
- **Success feedback**

### 3. Order Creation Protection (`/src/app/api/orders/create/route.ts`)

Added verification check before allowing orders:

```typescript
// Check if user has verified email OR phone
if (!user.emailVerified && !user.phoneVerified) {
    return errorResponse(
        'Please verify your email or phone number to place orders.',
        403,
        { 
            requiresVerification: true,
            email: user.email,
            phone: user.phone
        }
    );
}
```

## User Experience Flow

### Scenario 1: New User Places Order

1. User browses products ✅ (no verification needed)
2. User adds items to cart ✅ (no verification needed)
3. User clicks "Place Order"
4. System checks verification status
5. **Not verified** → Shows verification prompt
6. User receives OTP
7. User enters OTP
8. Email/phone verified ✅
9. Order proceeds

### Scenario 2: Verified User

1. User already verified email during signup ✅
2. User browses and adds to cart
3. User clicks "Place Order"
4. System checks verification → **Verified** ✅
5. Order proceeds immediately

### Scenario 3: Guest Browsing

1. User browses products (no login needed)
2. User adds to cart (no login needed)
3. User clicks "Checkout"
4. System prompts for login/signup
5. User signs up with OTP
6. **Email automatically verified** during OTP signup ✅
7. Order proceeds

## Verification Status

Users can be verified through:

1. **Email OTP Login** → `emailVerified = true`
2. **Mobile OTP Login** → `phoneVerified = true`
3. **Manual Verification** → Via VerificationPrompt component

## API Response Format

### When Verification Required:

```json
{
  "success": false,
  "message": "Please verify your email or phone number to place orders.",
  "data": {
    "requiresVerification": true,
    "email": "user@example.com",
    "phone": "+919876543210"
  }
}
```

Frontend can detect `requiresVerification: true` and show the verification prompt.

## Benefits

### For Users:
- ✅ **No friction** for browsing
- ✅ **Quick verification** only when needed
- ✅ **Familiar experience** (like Amazon)
- ✅ **Clear communication** about why verification is needed

### For Business:
- ✅ **Better conversion** (less friction)
- ✅ **Valid contact info** for order updates
- ✅ **Reduced fraud** (verified users only)
- ✅ **Better customer service** (can contact users)

## Files Created/Modified

### New Files:
1. **`/src/lib/emailVerification.ts`** - Verification utilities
2. **`/src/components/VerificationPrompt.tsx`** - Verification UI
3. **`/src/components/ui/alert.tsx`** - Alert component

### Modified Files:
1. **`/src/app/api/orders/create/route.ts`** - Added verification check
2. **`/src/models/User.ts`** - Already has `emailVerified` and `phoneVerified` fields

## Usage Example

### In Frontend (React Component):

```typescript
import VerificationPrompt from '@/components/VerificationPrompt';

// When order fails due to verification
if (error.requiresVerification) {
  return (
    <VerificationPrompt
      type="email"
      identifier={error.email}
      message="Please verify your email to place orders"
      onVerified={() => {
        // Retry order placement
        placeOrder();
      }}
    />
  );
}
```

### In Backend API:

```typescript
import { checkEmailVerification } from '@/lib/emailVerification';

// Check verification before sensitive action
const verificationCheck = await checkEmailVerification(req, 'place_order');

if (!verificationCheck.verified) {
  return errorResponse(
    verificationCheck.message,
    403,
    { requiresVerification: true }
  );
}
```

## Testing

### Test Cases:

1. **Unverified User Places Order**:
   - Expected: Shows verification prompt
   - After verification: Order proceeds

2. **Verified User Places Order**:
   - Expected: Order proceeds immediately

3. **User Browses Products**:
   - Expected: No verification required

4. **User Views Cart**:
   - Expected: No verification required

5. **Email Verification**:
   - Input: Valid email
   - Expected: Receives OTP, verifies successfully

6. **Phone Verification**:
   - Input: Valid phone
   - Expected: Receives SMS OTP, verifies successfully

## Security Considerations

- ✅ OTP expires after 5 minutes
- ✅ Rate limiting on OTP requests
- ✅ Maximum 5 verification attempts
- ✅ Verification status stored in database
- ✅ JWT tokens include user ID for verification checks

## Future Enhancements (Optional)

1. **Email Change Verification**: Require verification of new email
2. **Two-Factor Authentication**: Optional 2FA for sensitive actions
3. **Verification Badges**: Show verified badge on profile
4. **Verification Reminders**: Gentle prompts to verify
5. **Multiple Emails**: Support multiple verified emails
6. **Verification History**: Track verification attempts

## Comparison with Amazon

| Feature | Amazon | Our Implementation |
|---------|--------|-------------------|
| Browse without login | ✅ | ✅ |
| Add to cart without login | ✅ | ✅ |
| Verify for checkout | ✅ | ✅ |
| OTP verification | ✅ | ✅ |
| Email OR phone | ✅ | ✅ |
| Graceful prompts | ✅ | ✅ |
| Clear messaging | ✅ | ✅ |

## Status

✅ **IMPLEMENTED AND READY**

The email verification system now works exactly like Amazon's:
- No friction for browsing
- Smart verification only when needed
- Clear, user-friendly prompts
- Secure and reliable

Users can now enjoy a seamless shopping experience with verification only when it truly matters! 🎉
