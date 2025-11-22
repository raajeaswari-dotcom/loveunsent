import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const CLOUDINARY_ROOT_FOLDER = 'loveunsent'; // Root folder in Cloudinary

async function uploadFile(filePath: string, relativePath: string) {
    try {
        // Construct the public_id (filename without extension, prefixed with folder path)
        // Cloudinary folder structure will mirror local structure under 'loveunsent/images'
        // e.g. public/images/occasions/love.png -> loveunsent/images/occasions/love

        const fileDir = path.dirname(relativePath);
        const fileName = path.basename(relativePath, path.extname(relativePath));

        // Normalize path separators for Cloudinary (forward slashes)
        const cloudFolder = path.join(CLOUDINARY_ROOT_FOLDER, 'images', fileDir).split(path.sep).join('/');
        const publicId = `${cloudFolder}/${fileName}`;

        console.log(`Uploading ${relativePath} to ${publicId}...`);

        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            overwrite: true,
            resource_type: 'auto'
        });

        console.log(`✅ Uploaded: ${result.secure_url}`);
    } catch (error) {
        console.error(`❌ Failed to upload ${relativePath}:`, error);
    }
}

async function processDirectory(directory: string) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processDirectory(fullPath);
        } else {
            // Only process images
            if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item)) {
                const relativePath = path.relative(IMAGES_DIR, fullPath);
                await uploadFile(fullPath, relativePath);
            }
        }
    }
}

async function main() {
    console.log('🚀 Starting Cloudinary upload...');

    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Missing Cloudinary API keys. Please check your .env.local file.');
        process.exit(1);
    }

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
        process.exit(1);
    }

    await processDirectory(IMAGES_DIR);
    console.log('✨ All uploads complete!');
}

main().catch(console.error);
