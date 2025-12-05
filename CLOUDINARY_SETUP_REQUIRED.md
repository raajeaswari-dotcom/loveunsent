# 🔧 Cloudinary Setup - REQUIRED STEPS

## ❌ Current Issue
Images are returning 404 errors because:
1. Cloudinary API credentials are not configured
2. Images haven't been uploaded to Cloudinary yet

## ✅ Solution: Configure Cloudinary

### Step 1: Get Cloudinary Credentials

1. **Login to Cloudinary Dashboard**:
   - Go to: https://cloudinary.com/console
   - Login with your account

2. **Get Your Credentials**:
   - On the dashboard, you'll see:
     - **Cloud Name**: `djbdj9rax` (you already have this)
     - **API Key**: (copy this)
     - **API Secret**: (copy this - keep it secret!)

### Step 2: Add Credentials to `.env.local`

Open `c:\project\loveunsent\.env.local` and add these lines:

```env
# Cloudinary Configuration (REQUIRED for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djbdj9rax
CLOUDINARY_CLOUD_NAME=djbdj9rax
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Replace `your_api_key_here` and `your_api_secret_here` with your actual credentials from Cloudinary dashboard.**

### Step 3: Restart Development Server

After adding the credentials:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Upload Images

Now you can upload images using the super-admin panel:

1. **Go to any product page**:
   - `/super-admin/products/papers`
   - `/super-admin/products/collection`
   - `/super-admin/products/addons`
   - etc.

2. **Click "Add Item" or "Edit"** an existing product

3. **Upload Image**:
   - Click "Click to upload image"
   - Select an image file (PNG, JPG, max 5MB)
   - Wait for upload to complete
   - The Cloudinary URL will be automatically saved

## 📁 How It Works

### Upload Flow:
```
1. User selects image in ProductImageUpload component
   ↓
2. Image sent to /api/upload/public
   ↓
3. API converts image to base64
   ↓
4. uploadBase64ToCloudinary() uploads to Cloudinary
   ↓
5. Cloudinary returns secure_url
   ↓
6. URL saved in database
   ↓
7. getCloudinaryUrl() displays the image
```

### Folder Structure in Cloudinary:
```
loveunsent/
└── products/
    ├── image1.jpg
    ├── image2.png
    └── ...
```

## 🧪 Testing

### Test 1: Check Credentials
```bash
# In your terminal, check if env vars are set:
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

### Test 2: Upload a Test Image
1. Go to `/super-admin/products/papers`
2. Click "Add Item"
3. Fill in name and slug
4. Upload an image
5. Click "Create"
6. Check if image shows in the table

### Test 3: Verify in Cloudinary
1. Go to Cloudinary dashboard
2. Click "Media Library"
3. Navigate to `loveunsent/products`
4. You should see your uploaded images

## 🚨 Troubleshooting

### Error: "Server Configuration Error: Missing Cloudinary credentials"
- **Solution**: Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to `.env.local`
- Restart the dev server

### Error: "Failed to upload image to Cloudinary"
- **Check**: API credentials are correct
- **Check**: Cloudinary account is active
- **Check**: File size is under 5MB
- **Check**: File is a valid image format (PNG, JPG, GIF, WebP)

### Images still showing 404
- **Check**: Image was successfully uploaded (check Cloudinary dashboard)
- **Check**: Database has the correct imageUrl
- **Check**: getCloudinaryUrl() is being used in the component

## 📝 Environment Variables Checklist

Make sure your `.env.local` has ALL of these:

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary (REQUIRED)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djbdj9rax
CLOUDINARY_CLOUD_NAME=djbdj9rax
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key

# SMS (optional)
SMS_PROVIDER=MSG91
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=your_sender_id
MSG91_TEMPLATE_ID=your_template_id

# Email (optional)
RESEND_API_KEY=your_resend_key

# Master OTP (for testing)
MASTER_OTP=123456
```

## ✅ After Setup

Once configured, you'll be able to:
- ✅ Upload images through super-admin panel
- ✅ Images will be stored in Cloudinary
- ✅ Images will display correctly on all pages
- ✅ No more 404 errors!

## 🔗 Useful Links

- Cloudinary Dashboard: https://cloudinary.com/console
- Cloudinary Documentation: https://cloudinary.com/documentation
- API Reference: https://cloudinary.com/documentation/image_upload_api_reference
