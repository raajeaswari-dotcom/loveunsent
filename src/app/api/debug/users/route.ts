import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const count = await User.countDocuments();
        const users = await User.find({}).limit(5).select('name email role');

        return Response.json({
            success: true,
            count,
            sampleUsers: users,
            message: `Found ${count} users in database`
        });
    } catch (error: any) {
        return Response.json({
            success: false,
            error: error.message
        });
    }
}
