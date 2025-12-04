import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Collection } from "@/models/Collection";

export async function GET() {
    try {
        await connectDB();
        const collections = await Collection.find({}).lean();
        return NextResponse.json({
            count: collections.length,
            collections: collections.map(c => ({
                name: c.name,
                imageUrl: c.imageUrl
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
