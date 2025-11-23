const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const equalIndex = line.indexOf('=');
            if (equalIndex > 0) {
                const key = line.substring(0, equalIndex).trim();
                const value = line.substring(equalIndex + 1).trim();
                process.env[key] = value;
            }
        }
    });
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret exists:', !!process.env.CLOUDINARY_API_SECRET);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const CLOUDINARY_ROOT_FOLDER = 'loveunsent';

async function uploadFile(filePath, relativePath) {
    try {
        const fileDir = path.dirname(relativePath);
        const fileName = path.basename(relativePath, path.extname(relativePath));

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
        console.error(`❌ Failed to upload ${relativePath}:`, error.message);
    }
}

async function processDirectory(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processDirectory(fullPath);
        } else {
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
        console.error('Required: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
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
