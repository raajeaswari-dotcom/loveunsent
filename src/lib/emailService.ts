import nodemailer from 'nodemailer';

// Email service abstraction
export interface EmailService {
    sendOTP(email: string, code: string): Promise<boolean>;
}

// NodeMailer implementation
class NodeMailerService implements EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            // If SMTP credentials are provided, use real transport
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
            } else {
                // Fallback: JSON transport – emails are output to console for dev/testing
                console.warn('SMTP credentials missing – using JSON transport (dev mode)');
                this.transporter = nodemailer.createTransport({ jsonTransport: true });
            }
        } catch (error) {
            console.error('Failed to initialize email service:', error);
        }
    }

    async sendOTP(email: string, code: string): Promise<boolean> {
        if (!this.transporter) {
            console.error('Email transporter not initialized');
            return false;
        }

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@loveunsent.com',
                to: email,
                subject: 'Your Love Unsent Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #511317;">Love Unsent</h2>
                        <p>Your verification code is:</p>
                        <h1 style="background: #F3E9DD; padding: 20px; text-align: center; letter-spacing: 5px; color: #2C1B13;">
                            ${code}
                        </h1>
                        <p>This code will expire in 5 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #DBCDBE; margin: 20px 0;" />
                        <p style="color: #999; font-size: 12px;">Love Unsent - Handwritten Letters with Love</p>
                    </div>
                `
            });
            return true;
        } catch (error) {
            console.error('Failed to send email OTP:', error);
            return false;
        }
    }
}

// Export singleton instance
export const emailService: EmailService = new NodeMailerService();
