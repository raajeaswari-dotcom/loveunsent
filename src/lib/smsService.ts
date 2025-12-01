// SMS service abstraction
export interface SMSService {
    sendOTP(phone: string, code: string): Promise<boolean>;
}

// Twilio implementation
class TwilioService implements SMSService {
    private client: any = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            // Lazy load twilio to avoid errors if not installed
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
                // const twilio = require('twilio');
                // this.client = twilio(
                //     process.env.TWILIO_ACCOUNT_SID,
                //     process.env.TWILIO_AUTH_TOKEN
                // );
                console.warn('Twilio is not installed. Please install "twilio" package to use it.');
            }
        } catch (error) {
            console.warn('Twilio not configured or installed');
        }
    }

    async sendOTP(phone: string, code: string): Promise<boolean> {
        if (!this.client) {
            console.error('Twilio client not initialized');
            return false;
        }

        try {
            await this.client.messages.create({
                body: `Your Love Unsent verification code is: ${code}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            return true;
        } catch (error) {
            console.error('Failed to send SMS OTP:', error);
            return false;
        }
    }
}

// MSG91 implementation (India-focused, cheapest option)
class MSG91Service implements SMSService {
    async sendOTP(phone: string, code: string): Promise<boolean> {
        // Development mode: Just log OTP to console
        if (!process.env.MSG91_AUTH_KEY) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('═══════════════════════════════════════');
                console.log('📱 DEV MODE - SMS OTP');
                console.log(`Phone: ${phone}`);
                console.log(`OTP Code: ${code}`);
                console.log('═══════════════════════════════════════');
                return true; // Return success in dev mode
            }
            console.error('MSG91 not configured');
            return false;
        }

        try {
            // MSG91 v5 Send API
            const response = await fetch('https://control.msg91.com/api/v5/flow/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': process.env.MSG91_AUTH_KEY
                },
                body: JSON.stringify({
                    flow_id: process.env.MSG91_FLOW_ID, // Template/Flow ID from MSG91 dashboard
                    sender: process.env.MSG91_SENDER_ID || 'LOVTRS', // 6 char sender ID
                    mobiles: phone.replace('+', ''), // Remove + prefix
                    otp: code,
                    // Optional: custom variables for your template
                    var1: code,
                    var2: '5' // validity in minutes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('MSG91 API error:', data);
                return false;
            }

            console.log('MSG91 OTP sent successfully:', data);
            return true;
        } catch (error) {
            console.error('Failed to send MSG91 OTP:', error);
            return false;
        }
    }
}

// Factory to choose service based on env
function createSMSService(): SMSService {
    // If MASTER_OTP is set, use a dummy service that always succeeds
    if (process.env.MASTER_OTP) {
        return {
            sendOTP: async (phone: string, code: string) => {
                console.log(`[MASTER_OTP] Skipping SMS send to ${phone}. Code: ${code}`);
                return true;
            }
        };
    }

    const provider = process.env.SMS_PROVIDER || 'msg91';

    switch (provider.toLowerCase()) {
        case 'msg91':
            return new MSG91Service();
        case 'twilio':
            return new TwilioService();
        default:
            console.warn(`Unknown SMS provider: ${provider}, defaulting to MSG91`);
            return new MSG91Service();
    }
}

// Export singleton instance
export const smsService: SMSService = createSMSService();
