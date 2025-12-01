import { Resend } from 'resend';

// Email service abstraction
export interface EmailService {
    sendOTP(email: string, code: string): Promise<boolean>;
}

// Resend implementation (recommended for production)
class ResendService implements EmailService {
    private resend: Resend | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            if (process.env.RESEND_API_KEY) {
                this.resend = new Resend(process.env.RESEND_API_KEY);
                console.log('✅ Resend email service initialized');
            } else {
                console.warn('⚠️ RESEND_API_KEY not found - email will be logged to console (dev mode)');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Resend:', error);
        }
    }

    async sendOTP(email: string, code: string): Promise<boolean> {
        // Dev mode: log to console if Resend not configured
        if (!this.resend) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('═══════════════════════════════════════');
                console.log('📧 DEV MODE - EMAIL OTP');
                console.log(`Email: ${email}`);
                console.log(`OTP Code: ${code}`);
                console.log('═══════════════════════════════════════');
                return true;
            }
            console.error('❌ Resend not configured and not in dev mode');
            return false;
        }

        try {
            const { data, error } = await this.resend.emails.send({
                from: process.env.EMAIL_FROM || 'Love Unsent <onboarding@resend.dev>',
                to: email,
                subject: 'Your Love Unsent Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #511317; margin: 0; font-size: 28px;">Love Unsent</h1>
                            <p style="color: #8B4513; margin: 5px 0;">Handwritten Letters with Love</p>
                        </div>
                        
                        <div style="background: #FFF9F5; border-radius: 12px; padding: 30px; margin: 20px 0;">
                            <p style="color: #2C1B13; font-size: 16px; margin-bottom: 20px;">
                                Your verification code is:
                            </p>
                            <div style="background: #511317; color: #FFF9F5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${code}
                                </h1>
                            </div>
                            <p style="color: #8B4513; font-size: 14px; margin-top: 20px;">
                                ⏱️ This code will expire in <strong>5 minutes</strong>
                            </p>
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #DBCDBE;">
                            <p style="color: #999; font-size: 12px; text-align: center; margin: 5px 0;">
                                If you didn't request this code, please ignore this email.
                            </p>
                            <p style="color: #999; font-size: 12px; text-align: center; margin: 5px 0;">
                                © ${new Date().getFullYear()} Love Unsent - All rights reserved
                            </p>
                        </div>
                    </div>
                `
            });

            if (error) {
                console.error('❌ Resend API error:', error);
                return false;
            }

            console.log('✅ Email OTP sent successfully via Resend to:', email);
            console.log('📧 Message ID:', data?.id);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email OTP via Resend:', error);
            return false;
        }
    }
}

// Export singleton instance
export const emailService: EmailService = new ResendService();
