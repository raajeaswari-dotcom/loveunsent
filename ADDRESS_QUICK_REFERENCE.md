# Address Management - Quick Reference Guide

## 🚀 Quick Start

### For Users:

**Add Address in Dashboard:**
1. Go to `/dashboard` → "Profile & Addresses" tab
2. Click "Add New" button
3. Enter PIN code first (e.g., 560001)
4. City & State auto-fill
5. Fill remaining fields
6. Click "Save Address"

**Use Address in Order:**
1. Go to `/customize`
2. Fill message, paper, ink, add-ons
3. Scroll to "Recipient Details"
4. Click on an address card to select
5. Click "Add to Cart"

### For Developers:

**Key Files:**
- `src/models/User.ts` - Address schema
- `src/components/AddressSelector.tsx` - Address UI component
- `src/app/api/user/addresses/route.ts` - Address API
- `src/components/customer/ProfileForm.tsx` - Dashboard address management

**API Endpoints:**
- `GET /api/user/addresses` - Fetch addresses
- `POST /api/user/addresses` - Create address
- `DELETE /api/user/addresses?addressId=ID` - Delete address

## 📋 Address Fields

### Required Fields:
- ✅ Recipient Name
- ✅ Recipient Phone (10 digits)
- ✅ PIN Code (6 digits)
- ✅ Address Line 1
- ✅ City (auto-filled)
- ✅ State (auto-filled)

### Optional Fields:
- ⭕ Address Line 2
- ⭕ Landmark

### Auto-filled:
- 🤖 City (from PIN code)
- 🤖 State (from PIN code)
- 🤖 Country (default: India)

## 🎨 UI Components

### AddressSelector
```tsx
<AddressSelector
  selectedAddressId={state.recipientAddressId}
  onSelectAddress={(id) => updateState({ recipientAddressId: id })}
  userAddresses={addresses}
  onAddressesChange={fetchAddresses}
/>
```

### Usage in Forms
```tsx
// In SingleLetterForm
selectedAddressId={state.recipientAddressId}
onSelectAddress={(addressId) => updateState({ recipientAddressId: addressId })}
```

## 🔧 Common Code Patterns

### Fetch User Addresses
```typescript
const fetchAddresses = async () => {
  const response = await fetch('/api/user/addresses');
  if (response.ok) {
    const result = await response.json();
    setAddresses(result.data?.addresses || []);
  }
};
```

### Add New Address
```typescript
const addAddress = async (addressData) => {
  const response = await fetch('/api/user/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addressData),
  });
  const result = await response.json();
  return result.data?.addressId;
};
```

### Delete Address
```typescript
const deleteAddress = async (addressId) => {
  const response = await fetch(
    `/api/user/addresses?addressId=${addressId}`,
    { method: 'DELETE' }
  );
  return response.ok;
};
```

### Validate PIN Code
```typescript
import { isValidPinCode, fetchPinCodeData } from '@/lib/pinCodeValidator';

const validateAndAutofill = async (pincode) => {
  if (!isValidPinCode(pincode)) return;
  
  const data = await fetchPinCodeData(pincode);
  if (data) {
    setCity(data.city);
    setState(data.state);
  }
};
```

## 🗄️ Database Schema

```typescript
// User Model - addresses array
addresses: [
  {
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  }
]
```

## 🔍 Debugging Tips

### Check if addresses are loading:
```javascript
// Browser Console
localStorage.getItem('customization_state')
// Should show recipientAddressId when address selected
```

### Check API responses:
```javascript
// Network tab in DevTools
// Look for /api/user/addresses requests
// Status should be 200 (GET) or 201 (POST)
```

### Check MongoDB:
```javascript
// MongoDB shell
db.users.findOne(
  { email: "user@example.com" },
  { addresses: 1 }
)
```

## ⚠️ Common Issues

### "Loading addresses..." never completes
- ✅ Check if user is logged in
- ✅ Check MongoDB connection
- ✅ Check browser console for errors

### PIN code autofill not working
- ✅ Check internet connection
- ✅ Try different PIN code
- ✅ Check if India Post API is accessible

### Address not saving
- ✅ Ensure all required fields filled
- ✅ Validate PIN code is 6 digits
- ✅ Check API response in Network tab

### Address not appearing in customization
- ✅ Refresh the page
- ✅ Check if saved in Dashboard first
- ✅ Check fetch errors in console

## 📊 Validation Rules

### PIN Code:
- Must be exactly 6 digits
- Must be valid Indian PIN code
- Auto-fills city and state

### Phone Number:
- Must be 10 digits
- Numbers only

### Address Line 1:
- Required
- Minimum 5 characters

### City & State:
- Auto-filled from PIN code
- Can be manually edited if needed

## 🎯 Testing Checklist

- [ ] Add address in Dashboard
- [ ] Delete address in Dashboard
- [ ] Select saved address in Customize
- [ ] Add new address in Customize
- [ ] PIN code autofill works
- [ ] Validation prevents incomplete submissions
- [ ] Multiple addresses can be managed
- [ ] Bundle customization works
- [ ] Addresses persist in database
- [ ] No console errors

## 📱 Sample PIN Codes for Testing

| PIN Code | City | State |
|----------|------|-------|
| 560001 | Bangalore | Karnataka |
| 110001 | New Delhi | Delhi |
| 400001 | Mumbai | Maharashtra |
| 600001 | Chennai | Tamil Nadu |
| 700001 | Kolkata | West Bengal |
| 500001 | Hyderabad | Telangana |
| 380001 | Ahmedabad | Gujarat |
| 411001 | Pune | Maharashtra |

## 🔗 Related Files

### Components:
- `src/components/AddressSelector.tsx`
- `src/components/SingleLetterForm.tsx`
- `src/components/customer/ProfileForm.tsx`

### Pages:
- `src/app/dashboard/page.tsx`
- `src/app/customize/pageContent.tsx`
- `src/app/customize-bundle/page.tsx`

### API:
- `src/app/api/user/addresses/route.ts`
- `src/app/api/user/profile/route.ts`

### Models:
- `src/models/User.ts`

### Context:
- `src/context/CustomizationContext.tsx`

### Utilities:
- `src/lib/pinCodeValidator.ts`

## 💡 Pro Tips

1. **PIN Code First**: Always enter PIN code first to get auto-fill
2. **Multiple Addresses**: Users can save unlimited addresses
3. **Default Address**: Mark frequently used address as default
4. **Validation**: Form won't submit until all required fields filled
5. **Auto-selection**: Newly added address is auto-selected in customization
6. **Persistence**: Addresses saved permanently in user profile
7. **Bundle Orders**: Each letter can have different recipient address

## 📞 Support

For issues or questions:
1. Check `ADDRESS_TESTING_GUIDE.md` for detailed testing
2. Check `ADDRESS_IMPLEMENTATION_SUMMARY.md` for overview
3. Check `ADDRESS_ARCHITECTURE_DIAGRAM.md` for technical details

---

**Last Updated:** December 4, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
