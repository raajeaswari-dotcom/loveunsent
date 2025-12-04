import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyOTP } from "@/lib/otpHelpers";

// Test verification endpoint - REMOVE IN PRODUCTION
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const phone = url.searchParams.get('phone');
        const code = url.searchParams.get('code');

        if (!phone || !code) {
            return NextResponse.json({ error: "Phone and code required. Use ?phone=+919843256852&code=234567" }, { status: 400 });
        }

        console.log(`[TEST-VERIFY] GET Input: phone="${phone}", code="${code}"`);

        // Call the exact same function as verify-otp route
        const result = await verifyOTP(phone, "mobile", String(code));

        console.log(`[TEST-VERIFY] GET Result:`, result);

        return NextResponse.json({
            input: { phone, code },
            verifyResult: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error(`[TEST-VERIFY] GET Error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { phone, code } = body;

        if (!phone || !code) {
            return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
        }

        console.log(`[TEST-VERIFY] POST Input: phone="${phone}", code="${code}"`);

        // Call the exact same function as verify-otp route
        const result = await verifyOTP(phone, "mobile", String(code));

        console.log(`[TEST-VERIFY] POST Result:`, result);

        return NextResponse.json({
            input: { phone, code },
            verifyResult: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error(`[TEST-VERIFY] POST Error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
