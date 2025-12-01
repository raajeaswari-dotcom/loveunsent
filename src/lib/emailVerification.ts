/**
 * Email Verification Middleware and Utilities
 * Amazon-style email verification requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { User } from '@/models/User';
import connectDB from './db';

export interface VerificationRequirement {
    requiresEmailVerification: boolean;
    requiresPhoneVerification: boolean;
    message?: string;
}

/**
 * Check if email verification is required for a specific action
 * Following Amazon's approach:
 * - NOT required: Browsing, cart, viewing account
 * - REQUIRED: Placing orders, critical account changes
 */
export function getVerificationRequirements(action: string): VerificationRequirement {
    const requirements: Record<string, VerificationRequirement> = {
        // No verification needed
        'browse': { requiresEmailVerification: false, requiresPhoneVerification: false },
        'view_cart': { requiresEmailVerification: false, requiresPhoneVerification: false },
        'view_profile': { requiresEmailVerification: false, requiresPhoneVerification: false },
        'view_products': { requiresEmailVerification: false, requiresPhoneVerification: false },

        // Email verification required
        'place_order': {
            requiresEmailVerification: true,
            requiresPhoneVerification: false,
            message: 'Please verify your email to place orders and receive order confirmations.'
        },
        'request_refund': {
            requiresEmailVerification: true,
            requiresPhoneVerification: false,
            message: 'Email verification required to process refunds.'
        },
        'change_email': {
            requiresEmailVerification: true,
            requiresPhoneVerification: false,
            message: 'Please verify your current email before changing it.'
        },

        // Phone verification required
        'change_phone': {
            requiresEmailVerification: false,
            requiresPhoneVerification: true,
            message: 'Please verify your current phone number before changing it.'
        },

        // Both required for sensitive actions
        'delete_account': {
            requiresEmailVerification: true,
            requiresPhoneVerification: true,
            message: 'Both email and phone verification required to delete your account.'
        },
    };

    return requirements[action] || { requiresEmailVerification: false, requiresPhoneVerification: false };
}

/**
 * Middleware to check email verification status
 */
export async function checkEmailVerification(req: NextRequest, action: string) {
    const requirements = getVerificationRequirements(action);

    if (!requirements.requiresEmailVerification && !requirements.requiresPhoneVerification) {
        return { verified: true };
    }

    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return {
                verified: false,
                message: 'Authentication required',
                redirectTo: '/auth'
            };
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return {
                verified: false,
                message: 'Invalid session',
                redirectTo: '/auth'
            };
        }

        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId);

        if (!user) {
            return {
                verified: false,
                message: 'User not found',
                redirectTo: '/auth'
            };
        }

        // Check email verification
        if (requirements.requiresEmailVerification && !user.emailVerified) {
            return {
                verified: false,
                message: requirements.message || 'Email verification required',
                redirectTo: '/verify-email',
                user
            };
        }

        // Check phone verification
        if (requirements.requiresPhoneVerification && !user.phoneVerified) {
            return {
                verified: false,
                message: requirements.message || 'Phone verification required',
                redirectTo: '/verify-phone',
                user
            };
        }

        return { verified: true, user };
    } catch (error) {
        console.error('Verification check error:', error);
        return {
            verified: false,
            message: 'Verification check failed'
        };
    }
}

/**
 * Get user verification status
 */
export async function getUserVerificationStatus(userId: string) {
    try {
        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return null;
        }

        return {
            emailVerified: user.emailVerified || false,
            phoneVerified: user.phoneVerified || false,
            hasEmail: !!user.email,
            hasPhone: !!user.phone,
        };
    } catch (error) {
        console.error('Get verification status error:', error);
        return null;
    }
}
