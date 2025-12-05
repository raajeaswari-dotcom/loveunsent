import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { sendOTP, verifyOTP } from '@/lib/otpService';

/**
 * POST /api/user/update-contact
 * Step 1: Send OTP to new email/mobile
 */
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { type, value } = await req.json();

        if (!type || !value) {
            return NextResponse.json(
                { success: false, message: 'Type and value are required' },
                { status: 400 }
            );
        }

        if (type !== 'email' && type !== 'mobile') {
            return NextResponse.json(
                { success: false, message: 'Type must be email or mobile' },
                { status: 400 }
            );
        }

        await connectDB();

        // Validate format
        if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid email format' },
                    { status: 400 }
                );
            }
        } else {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(value)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid mobile number. Must be 10 digits starting with 6-9' },
                    { status: 400 }
                );
            }
        }

        // Check if email/phone already exists for another user
        const existingUser = await User.findOne({
            _id: { $ne: decoded.userId },
            [type === 'email' ? 'email' : 'phone']: value
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: `This ${type} is already registered to another account` },
                { status: 400 }
            );
        }

        // Send OTP
        const otpSent = await sendOTP(value, type);

        if (!otpSent) {
            return NextResponse.json(
                { success: false, message: 'Failed to send OTP. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `OTP sent to ${type === 'email' ? 'email' : 'mobile number'}`,
            data: { type, value }
        });

    } catch (error: any) {
        console.error('Error in update-contact POST:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/user/update-contact
 * Step 2: Verify OTP and update email/mobile
 */
export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { type, value, otp } = await req.json();

        if (!type || !value || !otp) {
            return NextResponse.json(
                { success: false, message: 'Type, value, and OTP are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify OTP
        const isValid = await verifyOTP(value, otp, type);

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Update user
        const updateData: any = {};
        if (type === 'email') {
            updateData.email = value;
            updateData.emailVerified = true;
        } else {
            updateData.phone = value;
            updateData.phoneVerified = true;
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${type === 'email' ? 'Email' : 'Mobile'} updated and verified successfully`,
            data: { user: updatedUser }
        });

    } catch (error: any) {
        console.error('Error in update-contact PUT:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
