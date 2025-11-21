// Stub for sending emails
export async function sendEmail(to: string, subject: string, body: string) {
    console.log(`[EMAIL STUB] Sending to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
}

// Stub for sending SMS
export async function sendSMS(phone: string, message: string) {
    console.log(`[SMS STUB] Sending to ${phone}`);
    console.log(`Message: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
}

// Stub for sending WhatsApp
export async function sendWhatsApp(phone: string, message: string) {
    console.log(`[WHATSAPP STUB] Sending to ${phone}`);
    console.log(`Message: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
}
