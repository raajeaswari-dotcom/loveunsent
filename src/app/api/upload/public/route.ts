import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { uploadBase64ToCloudinary } from '@/lib/cloudinaryHelpers';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return errorResponse('No file uploaded', 400);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return errorResponse('Invalid file type', 400);
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await uploadBase64ToCloudinary(base64Data, 'loveunsent/products');

        return successResponse({
            url: result.secure_url,
            imageId: result.public_id,
            uploadUrl: result.secure_url
        });

    } catch (error: any) {
        console.error('Public Upload Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
