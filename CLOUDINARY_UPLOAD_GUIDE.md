# Cloudinary Image Upload Guide

## Problem
Images are returning 404 errors because they haven't been uploaded to Cloudinary yet.

Example error:
```
https://res.cloudinary.com/djbdj9rax/image/upload/f_auto,q_auto/v1/loveunsent/papers/ivory.jpg
HTTP ERROR 404
```

## Solution Options

### Option 1: Use Built-in Upload Feature (Easiest)

The super-admin product pages have a built-in image upload component:

1. **Navigate to product page**:
   - Papers: `/super-admin/products/papers`
   - Collection: `/super-admin/products/collection`
   - Addons: `/super-admin/products/addons`
   - Handwriting: `/super-admin/products/handwriting`
   - Perfumes: `/super-admin/products/perfumes`
   - Occasions: `/super-admin/products/occasions`

2. **Create or Edit a product**:
   - Click "Add Item" for new product
   - Click "Edit" icon for existing product

3. **Upload Image**:
   - In the form, you'll see "Product Image" section
   - Click "Choose File" or drag & drop an image
   - The image will automatically upload to Cloudinary
   - The Cloudinary URL will be saved in the database

### Option 2: Manual Cloudinary Upload

1. **Login to Cloudinary**:
   - Go to: https://cloudinary.com/console
   - Login with your account

2. **Navigate to Media Library**:
   - Click "Media Library" in the sidebar

3. **Create Folder Structure**:
   ```
   loveunsent/
   ├── papers/
   ├── images/
   ├── handwriting/
   ├── perfumes/
   ├── addons/
   └── occasions/
   ```

4. **Upload Images**:
   - Click "Upload" button
   - Select your images
   - Make sure to upload to the correct folder
   - Use descriptive filenames (e.g., `ivory.jpg`, `parchment.jpg`)

5. **Get Image URLs**:
   - After upload, click on the image
   - Copy the "Secure URL"
   - Update your database with these URLs

### Option 3: Use Sample Images

If you don't have images yet, you can use placeholder services:

1. **Placeholder.com**:
   ```
   https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Paper+Image
   ```

2. **Unsplash (Free Stock Photos)**:
   ```
   https://source.unsplash.com/400x300/?paper,stationery
   ```

## Required Folder Structure in Cloudinary

For the app to work correctly, organize images like this:

```
loveunsent/
├── papers/
│   ├── ivory.jpg
│   ├── parchment.jpg
│   ├── kraft.jpg
│   └── ...
├── images/
│   ├── clasiic.png
│   ├── openwhen.png
│   ├── UNSENT.png
│   ├── GOOD BYE WITH LOVE.png
│   ├── WHEN YOU STRUGGLE.png
│   ├── TIME CAPSULE.png
│   ├── DAILY LITTLE THINGS.png
│   ├── OUR STORY.png
│   └── hero-letter.png
├── handwriting/
│   ├── cursive.jpg
│   ├── print.jpg
│   └── ...
├── perfumes/
│   ├── rose.jpg
│   ├── lavender.jpg
│   └── ...
├── addons/
│   ├── polaroid.jpg
│   ├── chocolate.jpg
│   ├── giftwrap.jpg
│   └── roses.jpg
└── occasions/
    ├── love_letters.png
    ├── birthday_wishes.png
    ├── thank_you.png
    └── ...
```

## Testing After Upload

1. **Get the Cloudinary URL** from the upload
2. **Test in browser**: Paste the URL directly in browser address bar
3. **Should see the image** (not a 404 error)
4. **Update database**: Use the super-admin panel to update product imageUrl

## Cloudinary Upload API (For Developers)

The app uses Cloudinary upload API at:
- Endpoint: `/api/upload/cloudflare`
- Method: POST
- Body: FormData with image file
- Returns: Cloudinary URL

This is used by the `ProductImageUpload` component.

## Quick Fix: Use Existing Cloudinary Images

If you want to use images that are already in Cloudinary, update the database imageUrl fields to match the actual paths in your Cloudinary account.

Example:
```javascript
// Current (404):
imageUrl: "loveunsent/papers/ivory.jpg"

// Should be (if image exists at different path):
imageUrl: "your-actual-folder/your-actual-filename.jpg"

// Or use full URL:
imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1234567890/your-folder/image.jpg"
```

## Need Help?

1. Check Cloudinary dashboard to see what images you have
2. Use the built-in upload feature in super-admin panel
3. Make sure folder structure matches the expected paths
