# Address Management System Implementation

## Overview
Implemented a comprehensive address management system with the following features:
- Full recipient address details with PIN code autofill
- Save, edit, and delete addresses in user dashboard
- Select saved addresses during order customization
- Option to add new addresses directly from the customization page

## Changes Made

### 1. Database Schema Updates

**File: `src/models/User.ts`**
- Updated the `addresses` array schema to include:
  - `recipientName` (required): Full name of the recipient
  - `recipientPhone` (required): 10-digit mobile number
  - `addressLine1` (required): Flat, House no., Building, Company, Apartment
  - `addressLine2` (optional): Area, Street, Sector, Village
  - `landmark` (optional): Nearby landmark
  - `city` (required): Auto-filled from PIN code
  - `state` (required): Auto-filled from PIN code
  - `pincode` (required): 6-digit PIN code
  - `country` (default: 'India')
  - `isDefault` (boolean): Mark as default address

### 2. Context Updates

**File: `src/context/CustomizationContext.tsx`**
- Added `recipientAddressId` field to `CustomizationState` type
- This stores the ID of the selected address from user's saved addresses
- Updated `initialState` to include `recipientAddressId: null`

### 3. New Components

**File: `src/components/AddressSelector.tsx`**
- Comprehensive address selector component with:
  - Display of all saved addresses with radio button selection
  - Visual indication of selected address
  - "Add New Address" form with:
    - Recipient name and phone fields
    - PIN code field with real-time validation
    - Auto-fill of city and state based on PIN code
    - Address line 1 (required) and line 2 (optional)
    - Landmark field (optional)
    - Visual feedback for PIN code validation (loading, valid, invalid)
  - Integration with address API for CRUD operations
  - Callback to refresh addresses after adding new ones

### 4. API Endpoints

**File: `src/app/api/user/addresses/route.ts`**
- **GET**: Fetch all addresses for authenticated user
- **POST**: Add a new address
  - Validates required fields
  - Handles default address logic (unsets other defaults if new one is default)
  - Returns the newly created address ID
- **PUT**: Update an existing address
  - Requires `addressId` in request body
  - Handles default address logic
- **DELETE**: Remove an address
  - Requires `addressId` as query parameter
  - Returns updated addresses list

### 5. Updated Components

**File: `src/components/customer/ProfileForm.tsx`**
- Completely rewritten to use new address structure
- Features:
  - Personal details section (name, email, phone with verification status)
  - Address management section with:
    - List of saved addresses with full details
    - Add new address form with PIN code autofill
    - Delete address functionality
    - Visual feedback for all operations
  - Uses new `/api/user/addresses` endpoints
  - Maintains backward compatibility with existing profile update

**File: `src/components/SingleLetterForm.tsx`**
- Replaced simple text fields (recipient name and address) with `AddressSelector` component
- Updated props interface:
  - Removed: `recipientName`, `setRecipientName`, `recipientAddress`, `setRecipientAddress`
  - Added: `selectedAddressId`, `onSelectAddress`
- Fetches user addresses on component mount
- Passes addresses to `AddressSelector` component
- Provides callback to refresh addresses after adding new ones

**File: `src/app/customize/pageContent.tsx`**
- Removed local state for `recipientName` and `recipientAddress`
- Updated to use `state.recipientAddressId` from CustomizationContext
- Updated validation to check for selected address instead of text fields
- Updated `handleAddToCart` to use address ID from state
- Updated `SingleLetterForm` props to pass address selection handlers

## User Flow

### Dashboard - Address Management
1. User navigates to Dashboard → Profile & Addresses tab
2. Can view all saved addresses with full details
3. Can add new address:
   - Enter recipient name and phone
   - Enter PIN code (city/state auto-filled)
   - Enter address lines and optional landmark
   - Save address
4. Can delete existing addresses
5. All addresses are saved to user's profile in MongoDB

### Order Customization - Address Selection
1. User creates a new order and goes to customization page
2. In "Recipient Details" section:
   - Sees all saved addresses as selectable cards
   - Can select an existing address by clicking on it
   - Can add a new address using "Add New Address" button
   - New address form appears with same fields as dashboard
   - After saving, new address is automatically selected
3. Selected address is stored in customization context
4. Validation ensures an address is selected before adding to cart

## Technical Features

### PIN Code Autofill
- Uses India Post API (`https://api.postalpincode.in/pincode/{pincode}`)
- Real-time validation with debouncing (500ms)
- Visual feedback:
  - Loading spinner during validation
  - Green checkmark for valid PIN code
  - Red error icon for invalid PIN code
  - Auto-filled fields highlighted in green
- Displays city and state information on successful validation

### Address Storage
- Addresses stored as subdocuments in User model
- Each address has a unique MongoDB `_id`
- Supports multiple addresses per user
- Default address functionality (only one can be default)

### Data Flow
1. User selects/adds address → Address ID stored in CustomizationContext
2. On "Add to Cart" → Address ID included in cart item details
3. At checkout → Address details fetched from user's saved addresses using ID
4. Order creation → Full address details saved with order

## Benefits

1. **User Convenience**: 
   - Save multiple addresses for different recipients
   - Reuse addresses across multiple orders
   - No need to re-enter address details

2. **Data Accuracy**:
   - PIN code validation ensures correct city/state
   - Structured address fields reduce errors
   - Consistent address format

3. **Better UX**:
   - Visual address selection with cards
   - Clear indication of selected address
   - Inline address addition without leaving customization page

4. **Scalability**:
   - Addresses stored separately from orders
   - Easy to update user's default address
   - Support for address book management

## Next Steps (Optional Enhancements)

1. Add "Set as Default" option in address cards
2. Add "Edit Address" functionality in dashboard
3. Add address validation using Google Maps API
4. Add address search/filter in customization page
5. Add delivery address vs billing address distinction
6. Add address verification via SMS/email
7. Export address management to separate page for better organization
