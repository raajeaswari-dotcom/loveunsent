import { NextResponse } from 'next/server';

export function successResponse(data: any, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, errors: any = null) {
    return NextResponse.json({ success: false, message, errors }, { status });
}
