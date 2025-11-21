import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

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

        // Parse Body for validation (optional, but good for metadata)
        // Cloudflare Direct Upload doesn't take file content here, it returns a URL.
        // But we can validate intent.

        // Cloudflare Configuration
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            return errorResponse('Server Configuration Error: Missing Cloudflare Keys', 500);
        }

        // Request Direct Upload URL from Cloudflare
        const formData = new FormData();
        formData.append('requireSignedURLs', 'true'); // Enforce signed URLs for access control

        // Metadata for tracking
        const metadata = {
            userId: decoded.userId,
            role: decoded.role,
            environment: process.env.NODE_ENV
        };
        formData.append('metadata', JSON.stringify(metadata));

        // Call Cloudflare API
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
            return errorResponse('Cloudflare Upload Failed', 502, data.errors);
        }

        // Return the upload URL and ID
        // The frontend will use 'uploadURL' to POST the file directly.
        // We can advise frontend on max file size (e.g., 10MB) but Cloudflare handles the hard limit.
        // We can set 'maxFileSize' in the request to Cloudflare if their API supports it for direct uploads (it usually does via policies, but basic direct upload is simple).

        return successResponse({
            uploadUrl: data.result.uploadURL,
            imageId: data.result.id,
            maxFileSizeMB: 10 // Inform frontend of policy
        });

    } catch (error: any) {
        console.error('Upload Route Error:', error);
        return errorResponse(error.message, 500);
    }
}
