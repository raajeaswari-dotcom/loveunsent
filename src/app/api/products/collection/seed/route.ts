import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Collection } from '@/models/Collection';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

const sampleProducts = [
    {
        name: 'Premium Leather Journal',
        slug: 'premium-leather-journal',
        description: 'Handcrafted leather journal with 200 pages of premium paper',
        price: 899,
        imageUrl: '/images/collection/leather-journal.jpg',
        category: 'stationery',
        stock: 50,
        isActive: true
    },
    {
        name: 'Vintage Fountain Pen Set',
        slug: 'vintage-fountain-pen-set',
        description: 'Classic fountain pen set with ink bottles and elegant case',
        price: 1299,
        imageUrl: '/images/collection/fountain-pen.jpg',
        category: 'stationery',
        stock: 30,
        isActive: true
    },
    {
        name: 'Handmade Greeting Card Set',
        slug: 'handmade-greeting-card-set',
        description: 'Set of 10 beautifully crafted greeting cards for all occasions',
        price: 499,
        imageUrl: '/images/collection/greeting-cards.jpg',
        category: 'gift',
        stock: 100,
        isActive: true
    },
    {
        name: 'Personalized Bookmark Collection',
        slug: 'personalized-bookmark-collection',
        description: 'Set of 5 metal bookmarks with custom engraving options',
        price: 349,
        imageUrl: '/images/collection/bookmarks.jpg',
        category: 'accessory',
        stock: 75,
        isActive: true
    },
    {
        name: 'Wax Seal Stamp Kit',
        slug: 'wax-seal-stamp-kit',
        description: 'Complete wax seal kit with stamps, wax sticks, and melting spoon',
        price: 699,
        imageUrl: '/images/collection/wax-seal.jpg',
        category: 'accessory',
        stock: 40,
        isActive: true
    },
    {
        name: 'Calligraphy Starter Set',
        slug: 'calligraphy-starter-set',
        description: 'Complete calligraphy set with pens, nibs, ink, and practice sheets',
        price: 799,
        imageUrl: '/images/collection/calligraphy-set.jpg',
        category: 'stationery',
        stock: 60,
        isActive: true
    },
    {
        name: 'Vintage Letter Writing Box',
        slug: 'vintage-letter-writing-box',
        description: 'Wooden box with stationery, envelopes, and writing accessories',
        price: 1499,
        imageUrl: '/images/collection/writing-box.jpg',
        category: 'gift',
        stock: 25,
        isActive: true
    },
    {
        name: 'Decorative Paper Clips Set',
        slug: 'decorative-paper-clips-set',
        description: 'Set of 20 decorative paper clips in various designs',
        price: 199,
        imageUrl: '/images/collection/paper-clips.jpg',
        category: 'accessory',
        stock: 150,
        isActive: true
    },
    {
        name: 'Handmade Envelope Collection',
        slug: 'handmade-envelope-collection',
        description: 'Pack of 25 handmade envelopes in assorted colors and textures',
        price: 399,
        imageUrl: '/images/collection/envelopes.jpg',
        category: 'stationery',
        stock: 80,
        isActive: true
    },
    {
        name: 'Vintage Postage Stamp Stickers',
        slug: 'vintage-postage-stamp-stickers',
        description: 'Collection of 50 vintage-style postage stamp stickers',
        price: 249,
        imageUrl: '/images/collection/stamp-stickers.jpg',
        category: 'accessory',
        stock: 120,
        isActive: true
    }
];

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get('token')?.value;
        if (!token) return errorResponse('Unauthorized', 401);

        const decoded: any = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin' && decoded.role !== 'super_admin')) {
            return errorResponse('Forbidden', 403);
        }

        // Check if products already exist
        const existingCount = await Collection.countDocuments();
        if (existingCount > 0) {
            return errorResponse('Sample products already exist. Clear the collection first.', 400);
        }

        // Insert sample products
        const collections = await Collection.insertMany(sampleProducts);
        return successResponse({
            message: `Successfully added ${collections.length} sample products`,
            collections
        }, 201);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
