# Address Management System - Architecture Diagram

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────┐          │
│  │   Dashboard Page     │         │  Customize Page      │          │
│  │  /dashboard          │         │  /customize          │          │
│  └──────────┬───────────┘         └──────────┬───────────┘          │
│             │                                 │                      │
│             │                                 │                      │
│  ┌──────────▼───────────┐         ┌──────────▼───────────┐          │
│  │   ProfileForm        │         │ SingleLetterForm     │          │
│  │   Component          │         │   Component          │          │
│  └──────────┬───────────┘         └──────────┬───────────┘          │
│             │                                 │                      │
│             │                                 │                      │
│             └────────────┬────────────────────┘                      │
│                          │                                           │
│                ┌─────────▼──────────┐                                │
│                │  AddressSelector   │                                │
│                │    Component       │                                │
│                └─────────┬──────────┘                                │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────────┐
│                    CONTEXT LAYER                                     │
├──────────────────────────┼───────────────────────────────────────────┤
│                          │                                           │
│                ┌─────────▼──────────┐                                │
│                │ CustomizationContext│                               │
│                │  - recipientAddressId                               │
│                └─────────┬──────────┘                                │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────────┐
│                      API LAYER                                       │
├──────────────────────────┼───────────────────────────────────────────┤
│                          │                                           │
│                ┌─────────▼──────────┐                                │
│                │ /api/user/addresses│                                │
│                │                    │                                │
│                │  GET    - Fetch    │                                │
│                │  POST   - Create   │                                │
│                │  PUT    - Update   │                                │
│                │  DELETE - Remove   │                                │
│                └─────────┬──────────┘                                │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────────┐
│                   DATABASE LAYER                                     │
├──────────────────────────┼───────────────────────────────────────────┤
│                          │                                           │
│                ┌─────────▼──────────┐                                │
│                │   MongoDB          │                                │
│                │   User Collection  │                                │
│                │                    │                                │
│                │   addresses: [     │                                │
│                │     {              │                                │
│                │       _id,         │                                │
│                │       recipientName│                                │
│                │       recipientPhone                                │
│                │       addressLine1 │                                │
│                │       addressLine2 │                                │
│                │       landmark,    │                                │
│                │       city,        │                                │
│                │       state,       │                                │
│                │       pincode,     │                                │
│                │       country,     │                                │
│                │       isDefault    │                                │
│                │     }              │                                │
│                │   ]                │                                │
│                └────────────────────┘                                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADDRESS MANAGEMENT FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

1. DASHBOARD - ADD ADDRESS
   ┌──────────────┐
   │ User clicks  │
   │ "Add New"    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────┐
   │ Form appears with:   │
   │ - Recipient Name     │
   │ - Recipient Phone    │
   │ - PIN Code (input)   │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐      ┌─────────────────────┐
   │ User enters PIN      │─────▶│ India Post API      │
   │ (e.g., 560001)       │      │ Validates & Returns │
   └──────┬───────────────┘      │ City & State        │
          │                      └─────────┬───────────┘
          │                                │
          ▼                                │
   ┌──────────────────────┐               │
   │ City & State         │◀──────────────┘
   │ Auto-filled          │
   │ (Bangalore, Karnataka)
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ User completes:      │
   │ - Address Line 1     │
   │ - Address Line 2     │
   │ - Landmark           │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Click "Save Address" │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐      ┌─────────────────────┐
   │ POST /api/user/      │─────▶│ MongoDB             │
   │ addresses            │      │ Saves address       │
   └──────┬───────────────┘      │ Returns _id         │
          │                      └─────────────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Success message      │
   │ Address appears      │
   │ in list              │
   └──────────────────────┘


2. CUSTOMIZE - SELECT ADDRESS
   ┌──────────────┐
   │ User goes to │
   │ /customize   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────┐      ┌─────────────────────┐
   │ GET /api/user/       │─────▶│ MongoDB             │
   │ addresses            │      │ Fetches all         │
   └──────┬───────────────┘      │ user addresses      │
          │                      └─────────┬───────────┘
          │                                │
          ▼                                │
   ┌──────────────────────┐               │
   │ AddressSelector      │◀──────────────┘
   │ displays all         │
   │ addresses as cards   │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ User clicks an       │
   │ address card         │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Address highlighted  │
   │ addressId stored in  │
   │ CustomizationContext │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ User clicks          │
   │ "Add to Cart"        │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Cart item includes   │
   │ recipientAddressId   │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Redirect to          │
   │ /checkout            │
   └──────────────────────┘


3. CUSTOMIZE - ADD NEW ADDRESS
   ┌──────────────┐
   │ User in      │
   │ /customize   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────┐
   │ Click "Add New       │
   │ Address" button      │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Form appears inline  │
   │ (same as dashboard)  │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Fill form with       │
   │ PIN code autofill    │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐      ┌─────────────────────┐
   │ POST /api/user/      │─────▶│ MongoDB             │
   │ addresses            │      │ Saves address       │
   └──────┬───────────────┘      │ Returns _id         │
          │                      └─────────┬───────────┘
          │                                │
          ▼                                │
   ┌──────────────────────┐               │
   │ New address auto-    │◀──────────────┘
   │ selected             │
   │ Form closes          │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Continue with order  │
   └──────────────────────┘
```

## PIN Code Autofill Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PIN CODE AUTOFILL PROCESS                         │
└─────────────────────────────────────────────────────────────────────┘

   User Input
       │
       ▼
   ┌──────────────────┐
   │ Enter PIN Code   │
   │ (e.g., 560001)   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Debounce 500ms   │  ◀── Prevents excessive API calls
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Validate Format  │
   │ (6 digits?)      │
   └────────┬─────────┘
            │
            ├─── Invalid ──▶ Show Error Icon
            │
            ▼ Valid
   ┌──────────────────┐
   │ Show Loading     │
   │ Spinner          │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Call India Post API          │
   │ api.postalpincode.in/        │
   │ pincode/{pincode}            │
   └────────┬─────────────────────┘
            │
            ├─── API Error ──▶ Show Error Message
            │
            ▼ Success
   ┌──────────────────┐
   │ Extract Data:    │
   │ - City           │
   │ - State          │
   │ - District       │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Auto-fill Fields │
   │ - City (green)   │
   │ - State (green)  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Show Success     │
   │ Checkmark        │
   │ "City, State"    │
   └──────────────────┘
```

## Address Data Structure

```javascript
// MongoDB User Document
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  
  addresses: [
    {
      _id: ObjectId("..."),              // Unique address ID
      recipientName: "Jane Smith",       // Who receives the letter
      recipientPhone: "9876543210",      // Recipient's contact
      addressLine1: "Flat 101, ABC Apartments",  // Building/Flat
      addressLine2: "MG Road",           // Area/Street (optional)
      landmark: "Near City Mall",        // Landmark (optional)
      city: "Bangalore",                 // Auto-filled from PIN
      state: "Karnataka",                // Auto-filled from PIN
      pincode: "560001",                 // 6-digit PIN code
      country: "India",                  // Default
      isDefault: false                   // Default address flag
    },
    {
      _id: ObjectId("..."),
      recipientName: "Bob Johnson",
      recipientPhone: "9123456789",
      addressLine1: "House 42, XYZ Colony",
      addressLine2: "Park Street",
      landmark: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
      isDefault: true                    // This is the default
    }
  ]
}
```

## CustomizationContext State

```javascript
// Stored in localStorage as 'customization_state'
{
  message: "Dear Friend, ...",
  paperId: "premium",
  handwritingId: null,
  perfumeId: null,
  addonIds: ["envelope", "wax-seal"],
  deliveryDate: null,
  inputMethod: "text",
  handwritingImageUrl: null,
  recipientAddressId: "64f7a8b9c1d2e3f4g5h6i7j8"  // ← Address reference
}
```

## Cart Item Structure

```javascript
// When adding to cart
{
  id: "custom_1701234567890",
  type: "letter",
  name: "Custom Handwritten Letter",
  price: 599,
  quantity: 1,
  details: {
    message: "Dear Friend, ...",
    paperId: "premium",
    addonIds: ["envelope", "wax-seal"],
    inkColor: "Blue",
    recipientAddressId: "64f7a8b9c1d2e3f4g5h6i7j8",  // ← Address ID
    occasion: "Birthday",
    breakdown: {
      baseFee: 299,
      paperCost: 200,
      addonsCost: 100
    }
  }
}
```

## API Request/Response Examples

### GET /api/user/addresses
```javascript
// Request
GET /api/user/addresses
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response (200 OK)
{
  "success": true,
  "data": {
    "addresses": [
      {
        "_id": "64f7a8b9c1d2e3f4g5h6i7j8",
        "recipientName": "Jane Smith",
        "recipientPhone": "9876543210",
        "addressLine1": "Flat 101, ABC Apartments",
        "addressLine2": "MG Road",
        "landmark": "Near City Mall",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001",
        "country": "India",
        "isDefault": false
      }
    ]
  }
}
```

### POST /api/user/addresses
```javascript
// Request
POST /api/user/addresses
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "recipientName": "Bob Johnson",
  "recipientPhone": "9123456789",
  "addressLine1": "House 42, XYZ Colony",
  "addressLine2": "Park Street",
  "landmark": "",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isDefault": false
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "message": "Address added successfully",
    "addressId": "64f7a8b9c1d2e3f4g5h6i7j9",
    "addresses": [ /* all addresses */ ]
  }
}
```

### DELETE /api/user/addresses
```javascript
// Request
DELETE /api/user/addresses?addressId=64f7a8b9c1d2e3f4g5h6i7j8
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response (200 OK)
{
  "success": true,
  "data": {
    "message": "Address deleted successfully",
    "addresses": [ /* remaining addresses */ ]
  }
}
```

---

**Legend:**
- ┌─┐ │ ├─┤ └─┘ : Box borders
- ─▶ : Data flow direction
- ◀── : Return/callback
- ▼ : Sequential flow
