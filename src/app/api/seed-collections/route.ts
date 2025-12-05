import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Collection } from '@/models/Collection';
import { successResponse, errorResponse } from '@/utils/apiResponse';

const collectionsToSeed = [
    {
        title: "OPEN WHEN",
        slug: "open-when",
        description: "A timeless bundle of sealed letters to be opened at just the right moment. “Open when you feel lost,” “Open when you need a smile,” “Open when you forget how strong you are.” Each envelope carries comfort, laughter, or encouragement — like a hug on paper, waiting exactly when you need it most.",
        price: 499,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875074/loveunsent/images/openwhen.png",
        category: "gift",
        stock: 100
    },
    {
        title: "CLASSIC",
        slug: "classic",
        description: "Pour your heart onto paper with our timeless Classic Letter. Perfect for any occasion, this is your chance to send a message that will be cherished for years to come. Every word is handwritten with care, sealed with wax, and sent with love.",
        price: 299,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875054/loveunsent/images/clasiic.png",
        category: "stationery",
        stock: 100
    },
    {
        title: "UNSENT",
        slug: "unsent",
        description: "Some words are meant just for you. The Unsent Letter is a space to express your deepest thoughts and feelings without the pressure of sending them. It's a powerful way to find closure, process emotions, and speak your truth, sealed for your eyes only.",
        price: 299,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875087/loveunsent/images/UNSENT.png",
        category: "stationery",
        stock: 100
    },
    {
        title: "GOODBYE WITH LOVE",
        slug: "goodbye-with-love",
        description: "Saying goodbye is never easy, but it can be done with grace and love. This letter offers a way to express your final thoughts, share cherished memories, and find peace for both you and the recipient.",
        price: 349,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875060/loveunsent/images/GOOD%20BYE%20WITH%20LOVE.png",
        category: "stationery",
        stock: 100
    },
    {
        title: "DAILY LITTLE THINGS",
        slug: "daily-little-things",
        description: "Celebrate the beauty of the ordinary. This letter is for capturing the small, everyday moments that make life so rich—a shared laugh, a quiet morning, a favorite song. It's a tapestry of the little things that mean everything.",
        price: 349,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875056/loveunsent/images/DAILY%20LITTLE%20THINGS.png",
        category: "gift",
        stock: 100
    },
    {
        title: "P.S. I LOVE YOU",
        slug: "ps-i-love-you",
        description: "Three simple words, a universe of meaning. This letter is dedicated to the purest expression of love, a keepsake for your special someone to hold close to their heart. Say it once more, with feeling.",
        price: 349,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875080/loveunsent/images/P.S.%20I%20LOVE%20YOU.png",
        category: "gift",
        stock: 100
    },
    {
        title: "WHEN YOU STRUGGLE",
        slug: "when-you-struggle",
        description: "A beacon of hope for difficult times. Write a letter of encouragement, support, and unwavering belief in someone's strength. It's a powerful reminder that they are not alone and that this, too, shall pass.",
        price: 349,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875090/loveunsent/images/WHEN%20YOU%20STRUGGLE.png",
        category: "stationery",
        stock: 100
    },
    {
        title: "TIME CAPSULE",
        slug: "time-capsule",
        description: "Capture a moment in time. Write a letter to a future self, a child on their graduation, or a loved one on a future anniversary. Seal your thoughts, memories, and hopes, and let time work its magic.",
        price: 499,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875085/loveunsent/images/TIME%20CAPSULE.png",
        category: "gift",
        stock: 100
    },
    {
        title: "OUR STORY",
        slug: "our-story",
        description: "Every relationship has a story. Recount your journey together, from the first hello to the present moment. A beautiful way to reminisce, celebrate your bond, and fall in love all over again.",
        price: 449,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875075/loveunsent/images/OUR%20STORY.png",
        category: "gift",
        stock: 100
    },
    {
        title: "FOR ALL SEASONS",
        slug: "for-all-seasons",
        description: "A letter for every season of life and love. Whether it's the bloom of spring or the quiet of winter, this is a space to reflect on the changing nature of your journey together, celebrating every phase.",
        price: 399,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875065/loveunsent/images/FOR%20ALL%20SEASONS.png",
        category: "gift",
        stock: 100
    },
    {
        title: "AN APOLOGY UNSPOKEN",
        slug: "an-apology-unspoken",
        description: "Sometimes, 'sorry' is the hardest word to say. This letter provides a sanctuary for your regrets, a place to articulate your apology with the sincerity it deserves, whether you choose to send it or keep it for your own peace.",
        price: 299,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875050/loveunsent/images/AN%20APOLOGY%20UNSPOKEN.png",
        category: "stationery",
        stock: 100
    },
    {
        title: "WORDS OF WISDOM",
        slug: "words-of-wisdom",
        description: "Share the lessons you've learned, the advice you hold dear, or the guidance you wish you'd received. A timeless gift of wisdom, passed from one heart to another, to be treasured for a lifetime.",
        price: 349,
        imageUrl: "https://res.cloudinary.com/djbdj9rax/image/upload/v1763875095/loveunsent/images/WORDS%20OF%20WISDOM.png",
        category: "gift",
        stock: 100
    }
];

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Remove existing collections
        await Collection.deleteMany({});

        // Add new collections
        // Note: Schema has 'name', but we used 'title' in array. Mapping it now.
        const docs = collectionsToSeed.map(c => ({
            name: c.title,
            slug: c.slug,
            description: c.description,
            price: c.price,
            imageUrl: c.imageUrl,
            category: c.category,
            stock: c.stock,
            isActive: true
        }));

        await Collection.insertMany(docs);

        return successResponse({ message: 'Collections seeded successfully', count: docs.length });
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}
