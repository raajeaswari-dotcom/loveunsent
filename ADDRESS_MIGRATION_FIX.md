# URGENT FIX: Address Schema Migration Issue

## Problem Identified

The error `addresses.0.pincode: Path 'pincode' is required` indicates that:
1. The user already has addresses saved with the OLD schema
2. When trying to save a NEW address, Mongoose validates ALL addresses in the array
3. The old addresses don't have the required fields from the new schema
4. Validation fails on the old addresses, preventing the new one from being saved

## Immediate Solution

You need to either:
1. **Delete existing addresses** from the database, OR
2. **Migrate existing addresses** to the new schema

### Option 1: Delete Existing Addresses (Quick Fix)

Run this in MongoDB shell or Compass:

```javascript
// Connect to your database
use love_unsent

// Find your user
db.users.findOne({ email: "your@email.com" })

// Clear all addresses for this user
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { addresses: [] } }
)
```

After clearing, try adding a new address again.

### Option 2: Migrate Existing Addresses (Proper Fix)

If you want to keep existing addresses, we need to migrate them:

```javascript
// In MongoDB shell
db.users.updateMany(
  { "addresses.0": { $exists: true } },
  [{
    $set: {
      addresses: {
        $map: {
          input: "$addresses",
          as: "addr",
          in: {
            _id: "$$addr._id",
            recipientName: { $ifNull: ["$$addr.recipientName", ""] },
            recipientPhone: { $ifNull: ["$$addr.recipientPhone", ""] },
            addressLine1: { $ifNull: ["$$addr.street", "$$addr.addressLine1", ""] },
            addressLine2: { $ifNull: ["$$addr.addressLine2", ""] },
            landmark: { $ifNull: ["$$addr.landmark", ""] },
            city: { $ifNull: ["$$addr.city", ""] },
            state: { $ifNull: ["$$addr.state", ""] },
            pincode: { $ifNull: ["$$addr.zip", "$$addr.pincode", ""] },
            country: { $ifNull: ["$$addr.country", "India"] },
            isDefault: { $ifNull: ["$$addr.isDefault", false] }
          }
        }
      }
    }
  }]
)
```

## Better Solution: Make Schema Backward Compatible

Let me update the schema to not require fields on existing documents:
