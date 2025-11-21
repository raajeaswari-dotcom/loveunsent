import cloudinary from './cloudinary';

/**
 * Upload a file to Cloudinary
 * @param file - File path or data URL
 * @param folder - Optional folder name in Cloudinary
 * @returns Cloudinary upload response with secure_url
 */
export async function uploadToCloudinary(
    file: string,
    folder: string = 'loveunsent'
): Promise<{ secure_url: string; public_id: string }> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'auto',
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file to Cloudinary');
    }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
}

/**
 * Upload image from base64 data
 * @param base64Data - Base64 encoded image data
 * @param folder - Optional folder name in Cloudinary
 */
export async function uploadBase64ToCloudinary(
    base64Data: string,
    folder: string = 'loveunsent'
): Promise<{ secure_url: string; public_id: string }> {
    try {
        const result = await cloudinary.uploader.upload(base64Data, {
            folder,
            resource_type: 'image',
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}
