# Critical Bug Fix: Duplicate User Creation

## 🔴 **The Bug**

When a user signed up with email and then tried to add/verify a mobile number (or vice versa), the system **created a NEW user account** instead of updating the existing one.

### What Happened:
1. User signs up with email → Account A created (email verified)
2. User clicks "+ Add Mobile" → Enters mobile and verifies OTP
3. System looks for user by mobile number → Doesn't find one
4. System creates NEW Account B (mobile verified, NO email)
5. Session switched to Account B
6. User's original Account A (with verified email) is orphaned ❌

### Result:
- User has 2 accounts in database
- Original email verification is lost
- Addresses and orders might be on wrong account

---

## ✅ **The Fix**

Both `/api/auth/email/verify-otp` and `/api/auth/mobile/verify-otp` now:

1. **Check if user is already logged in** (by reading the token cookie)
2. If logged in → **UPDATE the existing user** with the new contact method
3. If not logged in → Proceed with normal signup/login flow

### Code Changes:

**Before:**
```typescript
// Looked for user by phone/email only
let user = await User.findOne({ phone });
if (!user) {
  // Created NEW user ❌
  user = await User.create({ phone, ... });
}
```

**After:**
```typescript
// Check if user is already logged in
const token = req.cookies.get('token')?.value;
if (token) {
  const decoded = await verifyToken(token);
  const userId = decoded?.userId || decoded?.id;
  
  // Update EXISTING user ✅
  let user = await User.findById(userId);
  user.phone = phone;
  user.phoneVerified = true;
  await user.save();
  // Return updated user with SAME token
}

// Otherwise, normal signup/login flow
let user = await User.findOne({ phone });
...
```

---

## 📁 **Files Fixed**

1. ✅ `src/app/api/auth/mobile/verify-otp/route.ts`
2. ✅ `src/app/api/auth/email/verify-otp/route.ts`

---

## 🧪 **How To Test**

1. **Sign up with email**:
   - Email: test@example.com
   - Name: John Doe
   - Verify OTP → Logged in ✅

2. **Add mobile**:
   - Go to Dashboard → Profile
   - Click "+ Add Mobile"
   - Enter: +919876543210
   - Verify OTP (use 123456)
   
3. **Check results**:
   - Email should still show as verified ✅
   - Mobile should now show as verified ✅
   - Same user account (no duplicate created) ✅
   - Name should still be "John Doe" ✅

4. **Refresh page**:
   - Both email AND mobile show verified checkmarks ✅

---

## 🔧 **What To Do Now**

### For Existing Duplicate Accounts:

If you already have duplicate accounts from testing:

1. **Find them in database**:
   ```javascript
   // In MongoDB
   db.users.find({ $or: [
     { email: "test@example.com" },  
     { phone: "+919876543210" }
   ]})
   ```

2 **Merge manually** (if needed):
   - Choose which account to keep (usually the one with more data)
   - Copy over the missing fields manually
   - Delete the duplicate account

3. **Or just delete and start fresh**:
   - Delete both test accounts
   - Sign up again
   - Test the add email/mobile flow

### For Fresh Testing:

1. Clear cookies in browser
2. Sign up with a NEW email
3. Add mobile number
4. Verify both are on the SAME account ✅

---

## 🎯 **Benefits**

1. ✅ No more duplicate accounts
2. ✅ Email and mobile can coexist on same account
3. ✅ Verification status persists correctly
4. ✅ Amazon-like experience
5. ✅ Account recovery options (via email OR mobile)

---

## 📝 **Technical Notes**

- The fix checks for an existing session BEFORE checking database
- If logged in, it updates the current user's record
- The same JWT token is maintained (no new session)
- All verification statuses are preserved
- Works for both email → add mobile AND mobile → add email

---

**Status**: ✅ **FIXED**  
**Priority**: 🔴 **CRITICAL** (prevents data loss)  
**Impact**: 🟢 **Positive** (enables cross-verification feature)
