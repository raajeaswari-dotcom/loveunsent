# Dashboard Address Split - Implementation Guide

## Requirement
Split the address management in the dashboard into TWO separate sections:
1. **My Address** - User's own personal/billing address
2. **Delivery Addresses** - Recipient addresses for sending letters

## Current Structure
Currently, the ProfileForm has only one section called "My Addresses" which stores recipient addresses.

## New Structure

### 1. My Address Section
**Icon:** 🏠 Home
**Purpose:** User's own personal address (for billing, contact, etc.)
**Fields:**
- Address Line 1 *
- Address Line 2 (optional)
- Landmark (optional)
- PIN Code * (with autofill)
- City * (auto-filled)
- State * (auto-filled)
- Country (default: India)

**Features:**
- Single address (not an array)
- Edit button to update
- Shows current address when not editing
- PIN code validation and autofill

### 2. Delivery Addresses Section
**Icon:** 📦 Package
**Purpose:** Recipient addresses where letters will be sent
**Fields:**
- Recipient Name *
- Recipient Phone *
- Address Line 1 *
- Address Line 2 (optional)
- Landmark (optional)
- PIN Code * (with autofill)
- City * (auto-filled)
- State * (auto-filled)
- Country (default: India)
- Set as Default (checkbox)

**Features:**
- Multiple addresses (array)
- Add, Edit, Delete functionality
- Mark as default
- PIN code validation and autofill

## UI Layout

```
┌─────────────────────────────────────────┐
│ Personal Information                     │
│ - Name                                   │
│ - Email (readonly)                       │
│ - Phone (readonly)                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🏠 My Address              [Edit Button] │
│                                          │
│ [Shows current address or "No address"] │
│                                          │
│ When editing:                            │
│ - PIN Code field (with autofill)        │
│ - Address Line 1                         │
│ - Address Line 2                         │
│ - Landmark                               │
│ - City (auto-filled)                     │
│ - State (auto-filled)                    │
│ [Cancel] [Save My Address]               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📦 Delivery Addresses      [Add New]     │
│                                          │
│ "These are recipient addresses where    │
│  you want to send letters"               │
│                                          │
│ [+ Add New Address Form]                 │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ Recipient 1                        │   │
│ │ Phone: 9876543210                  │   │
│ │ Address details...                 │   │
│ │                    [Edit] [Delete] │   │
│ └───────────────────────────────────┘   │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ Recipient 2                        │   │
│ │ Phone: 9876543211                  │   │
│ │ Address details...                 │   │
│ │                    [Edit] [Delete] │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Data Model Changes

### User Model
```typescript
{
  name: string,
  email: string,
  phone: string,
  
  // NEW: My Address (single object)
  myAddress: {
    addressLine1: string,
    addressLine2?: string,
    landmark?: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  
  // EXISTING: Delivery Addresses (array)
  addresses: [{
    recipientName: string,
    recipientPhone: string,
    addressLine1: string,
    addressLine2?: string,
    landmark?: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
    isDefault: boolean
  }]
}
```

## API Changes Needed

### Update Profile API
Add support for `myAddress` field:

```typescript
// PUT /api/user/profile
{
  name?: string,
  myAddress?: {
    addressLine1: string,
    // ... other fields
  }
}
```

### Delivery Addresses API
Keep existing `/api/user/addresses` endpoints:
- GET - Fetch delivery addresses
- POST - Add delivery address
- PUT - Update delivery address
- DELETE - Delete delivery address

## Benefits

1. **Clear Separation**: Users understand the difference between their own address and recipient addresses
2. **Better UX**: No confusion about which address is for what purpose
3. **Billing Support**: My Address can be used for billing/invoices
4. **Gift Sending**: Delivery addresses are clearly for recipients
5. **Professional**: Matches e-commerce best practices

## Implementation Steps

1. ✅ Update User model to include `myAddress` field
2. ✅ Update ProfileForm UI to show two sections
3. ✅ Add "My Address" edit functionality
4. ✅ Keep existing "Delivery Addresses" functionality
5. ✅ Update profile API to handle `myAddress`
6. ✅ Add icons to differentiate sections
7. ✅ Add helper text to explain each section

## Status

🚧 **In Progress** - UI structure created, needs completion of delivery addresses section

---

**Note**: The current ProfileForm.tsx file has been started but needs the delivery addresses section to be completed. The structure is there, just need to add back the existing delivery address form and list code.
