import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['super_admin', 'admin', 'writer', 'qc', 'customer']),
    isActive: z.boolean().optional()
});

import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        console.log('Create User API - Headers:', Object.fromEntries(req.headers));
        console.log('Create User API - Cookies (next/headers):', cookieStore.getAll());

        if (!token) {
            console.log('Create User API - Unauthorized: No token found in cookies');
            return errorResponse('Route: Unauthorized', 401);
        }

        const decoded: any = verifyToken(token);
        if (!decoded || decoded.role !== 'super_admin') {
            return errorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const result = createUserSchema.safeParse(body);

        if (!result.success) {
            return errorResponse('Validation Error', 400, result.error.format());
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: result.data.email });
        if (existingUser) {
            return errorResponse('Email already exists', 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(result.data.password, 10);

        // Create user
        const user = await User.create({
            name: result.data.name,
            email: result.data.email,
            passwordHash,
            role: result.data.role,
            isActive: result.data.isActive ?? true
        });

        return successResponse({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
