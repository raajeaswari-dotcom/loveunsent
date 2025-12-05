import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded) return errorResponse('Invalid Token', 401);

        // Role Check: Only Writers, Admins, and Super Admins can upload
        const allowedRoles = ['writer', 'admin', 'super_admin'];
        if (!allowedRoles.includes(decoded.role)) {
            return errorResponse('Forbidden: Insufficient permissions', 403);
        }

        // Check Cloudinary configuration
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            return errorResponse('Server Configuration Error: Missing Cloudinary credentials', 500);
        }

        // Get the file from form data
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'loveunsent';

        if (!file) {
            return errorResponse('No file provided', 400);
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const uploadResult = result as any;

        return successResponse({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
        });

    } catch (error: any) {
        console.error('Cloudinary Upload Error:', error);
        return errorResponse(error.message || 'Upload failed', 500);
    }
}
