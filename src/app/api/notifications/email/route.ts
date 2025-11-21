import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

// Mock Email Sender
async function sendEmail(to: string, subject: string, body: string) {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}, Body: ${body}`);
    return true;
}

const emailSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string()
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        // Only Admin/System should trigger manual emails via API
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = emailSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { to, subject, body: emailBody } = result.data;

        await sendEmail(to, subject, emailBody);

        return successResponse({ sent: true });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
