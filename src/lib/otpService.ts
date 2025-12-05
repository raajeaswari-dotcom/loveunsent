
import { createOTP, verifyOTP as verifyOTPHelper } from './otpHelpers';
import { emailService } from './emailService';
import { smsService } from './smsService';

/**
 * Sends an OTP to the specified identifier (email or mobile).
 * 
 * @param identifier - The email address or mobile number.
 * @param type - The type of communication ('email' or 'mobile').
 * @returns boolean - True if OTP sent successfully, false otherwise.
 */
export async function sendOTP(identifier: string, type: 'email' | 'mobile'): Promise<boolean> {
    try {
        // Generate OTP and store in DB
        const code = await createOTP(identifier, type, 'update-contact');

        // Send via appropriate channel
        if (type === 'email') {
            return await emailService.sendOTP(identifier, code);
        } else {
            return await smsService.sendOTP(identifier, code);
        }
    } catch (error) {
        console.error('Error in sendOTP:', error);
        return false;
    }
}

/**
 * Verifies the provided OTP for the given identifier.
 * 
 * @param identifier - The email address or mobile number.
 * @param otp - The OTP code to verify.
 * @param type - The type of communication ('email' or 'mobile').
 * @returns boolean - True if OTP is valid, false otherwise.
 */
export async function verifyOTP(identifier: string, otp: string, type: 'email' | 'mobile'): Promise<boolean> {
    try {
        // Adapter to match otpHelpers signature: verifyOTP(identifier, type, code)
        const result = await verifyOTPHelper(identifier, type, otp);
        return result.success;
    } catch (error) {
        console.error('Error in verifyOTP adapter:', error);
        return false;
    }
}
