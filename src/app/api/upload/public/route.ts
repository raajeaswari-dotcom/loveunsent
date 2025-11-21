import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function POST(req: NextRequest) {
    try {
        // Cloudflare Configuration
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            return errorResponse('Server Configuration Error', 500);
        }

        // Request Direct Upload URL from Cloudflare
        const formData = new FormData();
        formData.append('requireSignedURLs', 'false'); // Public access for now, or implement signed URLs logic if needed

        // Metadata
        const metadata = {
            type: 'handwriting_upload',
            environment: process.env.NODE_ENV
        };
        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Cloudflare Error:', data.errors);
            return errorResponse('Upload Failed', 502);
        }

        return successResponse({
            uploadUrl: data.result.uploadURL,
            imageId: data.result.id
        });

    } catch (error: any) {
        console.error('Public Upload Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
