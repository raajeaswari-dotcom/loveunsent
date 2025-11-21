import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { z } from 'zod';

// Mock WhatsApp Sender
async function sendWhatsApp(phone: string, message: string) {
    console.log(`[WHATSAPP MOCK] To: ${phone}, Message: ${message}`);
    return true;
}

const whatsappSchema = z.object({
    phone: z.string(),
    message: z.string()
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = whatsappSchema.safeParse(body);
        if (!result.success) return errorResponse('Validation Error', 400, result.error.format());

        const { phone, message } = result.data;

        await sendWhatsApp(phone, message);

        return successResponse({ sent: true });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
