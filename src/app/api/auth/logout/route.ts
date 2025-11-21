import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/utils/apiResponse';

export async function POST(req: NextRequest) {
    const response = successResponse({ message: 'Logged out successfully' });
    response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
}
