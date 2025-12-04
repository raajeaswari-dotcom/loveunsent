# Testing Guide - Address Management System

## Prerequisites
- Make sure the development server is running: `npm run dev`
- Have a user account created and logged in
- MongoDB should be running and connected

## Test Scenarios

### 1. Dashboard - Add New Address

**Steps:**
1. Navigate to `/dashboard`
2. Click on "Profile & Addresses" tab
3. Click "Add New" button in the "My Addresses" section
4. Fill in the new address form:
   - **Recipient Name**: Enter a full name (e.g., "John Doe")
   - **Recipient Phone**: Enter 10-digit mobile (e.g., "9876543210")
   - **PIN Code**: Enter a valid Indian PIN code (e.g., "560001" for Bangalore)
     - Watch for auto-fill of City and State
     - Green checkmark should appear when valid
   - **Address Line 1**: Enter building/flat details (e.g., "Flat 101, ABC Apartments")
   - **Address Line 2** (Optional): Enter area/street (e.g., "MG Road")
   - **Landmark** (Optional): Enter landmark (e.g., "Near City Mall")
   - **City**: Should be auto-filled (editable)
   - **State**: Should be auto-filled (editable)
   - **Country**: India (read-only)
5. Click "Save Address"
6. Verify:
   - Success message appears
   - New address appears in the list
   - Address shows all entered details

**Expected Result:**
- Address saved successfully
- Appears in the address list with all details
- Can be selected for orders

### 2. Dashboard - Delete Address

**Steps:**
1. Navigate to `/dashboard` → "Profile & Addresses" tab
2. Find an existing address in the list
3. Click the trash icon (🗑️) on the right side
4. Confirm deletion in the popup
5. Verify:
   - Success message appears
   - Address removed from the list

**Expected Result:**
- Address deleted successfully
- No longer appears in the list

### 3. Customize Page - Select Saved Address

**Steps:**
1. Navigate to `/customize` (or click "Create Your First Letter" from dashboard)
2. Fill in Message, Paper, Ink Color, and Add-ons sections
3. Scroll to "5. Recipient Details" section
4. Verify:
   - All saved addresses are displayed as cards
   - Each card shows full address details
5. Click on an address card to select it
6. Verify:
   - Selected address is highlighted with border and checkmark
   - Only one address can be selected at a time
7. Click "Add to Cart"
8. Verify:
   - Validation passes (no error about missing address)
   - Redirected to checkout page

**Expected Result:**
- Can select any saved address
- Selected address is stored in customization context
- Can proceed to checkout

### 4. Customize Page - Add New Address

**Steps:**
1. Navigate to `/customize`
2. Scroll to "5. Recipient Details" section
3. Click "Add New Address" button
4. Fill in the new address form (same as Dashboard test)
5. Click "Save Address"
6. Verify:
   - Success message appears
   - New address form closes
   - Newly added address is automatically selected
   - New address appears in the list
7. Click "Add to Cart"
8. Verify:
   - Can proceed to checkout with the new address

**Expected Result:**
- Can add new address from customization page
- New address is automatically selected
- Can proceed to checkout

### 5. Bundle Customization - Address Selection

**Steps:**
1. Navigate to `/customize-bundle?count=3`
2. For each letter in the bundle:
   - Fill in Message, Paper, Ink Color
   - Select or add a recipient address
   - Click "Save & Next Letter"
3. Review the bundle
4. Verify:
   - Each letter shows "Address Selected" in review
5. Click "Add Bundle to Cart"
6. Verify:
   - All letters added to cart
   - Each has its own recipient address

**Expected Result:**
- Each letter in bundle can have different recipient address
- All addresses saved correctly
- Can proceed to checkout

### 6. PIN Code Autofill Validation

**Steps:**
1. Go to any address form (Dashboard or Customize page)
2. Test different PIN codes:
   - **Valid PIN**: "560001" → Should show "Bangalore, Karnataka"
   - **Valid PIN**: "110001" → Should show "New Delhi, Delhi"
   - **Valid PIN**: "400001" → Should show "Mumbai, Maharashtra"
   - **Invalid PIN**: "000000" → Should show error
   - **Incomplete PIN**: "5600" → Should show idle state
3. Verify:
   - Loading spinner appears during validation
   - Green checkmark for valid PIN
   - Red error icon for invalid PIN
   - City and State auto-filled with green background
   - Can still manually edit City and State if needed

**Expected Result:**
- PIN code validation works correctly
- Auto-fill populates City and State
- Visual feedback is clear and helpful

### 7. Multiple Addresses Management

**Steps:**
1. Add 3-5 different addresses in Dashboard
2. Navigate to Customize page
3. Verify:
   - All addresses appear in the selector
   - Can scroll through addresses if many
   - Each address is clearly distinguishable
4. Select different addresses and verify selection changes

**Expected Result:**
- Can manage multiple addresses
- All addresses accessible from customization
- Easy to distinguish between addresses

## API Testing

### Test Address API Endpoints

**GET /api/user/addresses**
```bash
# Should return all user addresses
curl http://localhost:3000/api/user/addresses \
  -H "Cookie: token=YOUR_TOKEN"
```

**POST /api/user/addresses**
```bash
# Should create new address
curl -X POST http://localhost:3000/api/user/addresses \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "recipientName": "Test User",
    "recipientPhone": "9876543210",
    "addressLine1": "Test Address",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "country": "India"
  }'
```

**DELETE /api/user/addresses**
```bash
# Should delete address
curl -X DELETE "http://localhost:3000/api/user/addresses?addressId=ADDRESS_ID" \
  -H "Cookie: token=YOUR_TOKEN"
```

## Common Issues & Solutions

### Issue: "Loading addresses..." never completes
**Solution:** 
- Check if user is logged in
- Check MongoDB connection
- Check browser console for API errors

### Issue: PIN code autofill not working
**Solution:**
- Check internet connection (uses external API)
- Try a different PIN code
- Check browser console for API errors

### Issue: Address not saving
**Solution:**
- Ensure all required fields are filled
- Check if PIN code is valid
- Check MongoDB connection
- Check browser console for errors

### Issue: Address not appearing in customization
**Solution:**
- Refresh the page
- Check if address was saved in Dashboard
- Check browser console for fetch errors

## Browser Console Checks

Open browser DevTools (F12) and check:

1. **Network Tab:**
   - `/api/user/addresses` requests should return 200
   - POST requests should return 201
   - Check request/response payloads

2. **Console Tab:**
   - No red errors related to addresses
   - Check for any warnings

3. **Application Tab:**
   - Check localStorage for `customization_state`
   - Should contain `recipientAddressId` when address is selected

## Database Verification

Check MongoDB to verify addresses are saved:

```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "your@email.com" }, { addresses: 1 })
```

Should show addresses array with all fields:
- recipientName
- recipientPhone
- addressLine1
- addressLine2
- landmark
- city
- state
- pincode
- country
- isDefault
- _id

## Success Criteria

✅ Can add new addresses from Dashboard
✅ Can delete addresses from Dashboard
✅ Can select saved addresses in Customize page
✅ Can add new addresses from Customize page
✅ PIN code autofill works correctly
✅ Address validation prevents incomplete submissions
✅ Multiple addresses can be managed
✅ Bundle customization supports different addresses per letter
✅ All addresses persist in database
✅ No TypeScript compilation errors (except test files)
