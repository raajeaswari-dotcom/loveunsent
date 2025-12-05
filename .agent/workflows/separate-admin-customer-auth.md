---
description: Separate Admin and Customer Authentication & Access
---

# Separate Admin and Customer Authentication & Access

## Problem Statement
Currently, the system has mixed authentication flows where:
1. Admin roles (super_admin, admin, writer, qc) use OTP-based login
2. These admin roles potentially have access to customer features (checkout, cart, purchases)
3. There's no clear separation between admin and customer authentication flows

## Required Changes

### 1. **Authentication Separation**

#### Admin Roles (super_admin, admin, writer, qc)
- **Login Method**: Email/Password ONLY (no OTP)
- **Login Pages**:
  - `/super-admin/login` - Already uses email/password ✅
  - `/admin/login` - Currently uses OTP ❌ (needs to be changed to email/password)
- **Access**: Admin panels only, NO access to customer features

#### Customer Role
- **Login Method**: OTP-based (email or mobile)
- **Login Pages**:
  - `/auth` - Customer OTP login page
  - `/login` - Redirect to `/auth`
- **Access**: Customer features (checkout, cart, orders, profile), NO access to admin panels

### 2. **Files to Modify**

#### A. Admin Login Page
**File**: `src/app/admin/login/page.tsx`
- Remove OTP-based authentication
- Implement email/password login (similar to super-admin login)
- Keep role-based redirection (admin → /admin/dashboard, qc → /qc, writer → /writer/orders)

#### B. Middleware Protection
**File**: `src/middleware.ts`
- Add checkout, cart, and customer-only routes to role protection
- Prevent admin roles from accessing customer purchase flows
- Ensure customers cannot access admin panels

#### C. Header Component
**File**: `src/components/Header.tsx`
- Hide cart icon and checkout links for admin roles
- Show different navigation based on role

#### D. API Route Protection
**Files**: Various API routes
- `/api/cart/*` - Customer only
- `/api/checkout/*` - Customer only
- `/api/payments/*` - Customer only
- Admin API routes - Admin roles only

### 3. **Implementation Steps**

#### Step 1: Update Admin Login Page
Replace OTP login with email/password authentication in `/admin/login`

#### Step 2: Update Middleware
Add role-based restrictions for customer-only routes:
- `/checkout`
- `/cart`
- `/dashboard` (customer dashboard)
- `/orders` (customer orders)
- `/profile`

#### Step 3: Update Header Component
Conditionally render customer features based on role

#### Step 4: Protect API Routes
Add role checks to customer-specific API endpoints

#### Step 5: Update Auth Context
Ensure proper role handling and redirection

### 4. **Testing Checklist**

- [ ] Super Admin can login with email/password
- [ ] Admin can login with email/password
- [ ] Writer can login with email/password
- [ ] QC can login with email/password
- [ ] Customer can login with OTP (email or mobile)
- [ ] Admin roles CANNOT access checkout
- [ ] Admin roles CANNOT access cart
- [ ] Admin roles CANNOT make purchases
- [ ] Customers CANNOT access admin panels
- [ ] Proper redirects based on role after login
- [ ] Header shows correct navigation for each role

### 5. **Database Considerations**

All admin users in the database should have:
- `passwordHash` field populated (for email/password login)
- `role` field set to: super_admin, admin, writer, or qc
- Optional: `email` and `phone` can be null for customers who only use one method

Customer users should have:
- `role` field set to: customer
- Either `email` or `phone` (or both) for OTP login
- `passwordHash` can be null (OTP-only authentication)
