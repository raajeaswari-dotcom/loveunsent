# Address Schema Fix - Issue Resolution

## Problem
When trying to save an address, the following error occurred:
```
User validation failed: addresses.0.pincode: Path `pincode` is required., 
addresses.0.addressLine1: Path `addressLine1` is required., 
addresses.0.recipientPhone: Path `recipientPhone` is required., 
addresses.0.recipientName: Path `recipientName` is required.
```

## Root Cause
The address fields were defined inline within the UserSchema's addresses array. Mongoose requires subdocument schemas to be defined separately when using validation with `required: true`.

## Solution Applied

### Before (Incorrect):
```typescript
const UserSchema = new Schema({
  // ... other fields
  addresses: [
    {
      recipientName: { type: String, required: true },
      recipientPhone: { type: String, required: true },
      // ... other fields
    },
  ],
});
```

### After (Correct):
```typescript
// Separate subdocument schema
const AddressSchema = new Schema({
  recipientName: {
    type: String,
    required: [true, "Recipient name is required"],
    trim: true,
  },
  recipientPhone: {
    type: String,
    required: [true, "Recipient phone is required"],
    trim: true,
  },
  // ... other fields
}, { _id: true }); // Enable _id for subdocuments

const UserSchema = new Schema({
  // ... other fields
  addresses: [AddressSchema],
});
```

## Changes Made

**File: `src/models/User.ts`**

1. Created separate `AddressSchema` with:
   - Proper validation messages
   - `trim: true` for all string fields
   - PIN code validation (6 digits)
   - `_id: true` to enable subdocument IDs

2. Updated `UserSchema` to use `AddressSchema`:
   - Changed from inline object to schema reference
   - Maintains all validation rules
   - Enables proper subdocument handling

## Benefits

1. **Proper Validation**: Mongoose now correctly validates subdocuments
2. **Better Error Messages**: Custom error messages for each field
3. **Subdocument IDs**: Each address gets a unique `_id`
4. **Cleaner Code**: Separation of concerns
5. **Type Safety**: Better TypeScript support

## Testing

After this fix, you should be able to:

1. ✅ Add new addresses from Dashboard
2. ✅ Add new addresses from Customize page
3. ✅ All required fields properly validated
4. ✅ Each address gets a unique `_id`
5. ✅ No validation errors

## Verification Steps

1. **Clear any cached data** (if needed):
   ```bash
   # Restart the dev server
   npm run dev
   ```

2. **Test adding an address**:
   - Go to `/dashboard` → Profile & Addresses
   - Click "Add New"
   - Fill in all required fields
   - Click "Save Address"
   - Should save successfully

3. **Check MongoDB**:
   ```javascript
   db.users.findOne({ email: "your@email.com" }, { addresses: 1 })
   ```
   - Each address should have an `_id` field
   - All fields should be present

## Additional Validation Added

The fix also includes enhanced validation:

- **PIN Code**: Must be exactly 6 digits
- **All String Fields**: Automatically trimmed
- **Required Fields**: Clear error messages
- **Default Values**: Country defaults to "India"

## Status

✅ **FIXED** - The address schema now properly validates and saves addresses without errors.

---

**Fixed Date**: December 4, 2025
**Issue**: Mongoose subdocument validation error
**Resolution**: Created separate AddressSchema
