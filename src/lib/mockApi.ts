// Mock API Client for Frontend Development
// This allows the frontend to be built and tested without a running backend.
import { getCloudinaryUrl } from "@/lib/cloudinaryClient";

export const mockPapers = [
    {
        id: "ordinary",
        name: "Ordinary Paper",
        price: 0,
        image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1974&auto=format&fit=crop",
        description: "Simple, classic paper for your heartfelt words.",
    },
    { id: 'p1', name: 'Premium Ivory Paper', type: 'paper', price: 150, image: getCloudinaryUrl('/images/paper-ivory.png'), description: 'Luxurious ivory paper, 120gsm.' },
    { id: 'p2', name: 'Vintage Parchment', type: 'paper', price: 200, image: getCloudinaryUrl('/images/paper-parchment.png'), description: 'Aged look for a classic feel.' },
];

export const mockPerfumes = [
    { id: 'pf1', name: 'Rose Garden', price: 50, image: getCloudinaryUrl('/images/perfume-rose.png') },
    { id: 'pf2', name: 'Sandalwood', price: 60, image: getCloudinaryUrl('/images/perfume-rose.png') },
];

export const mockHandwritings = [
    { id: 'hw1', name: 'Elegant Cursive', image: getCloudinaryUrl('/images/handwriting-cursive.png'), isCursive: true },
    { id: 'hw2', name: 'Neat Print', image: getCloudinaryUrl('/images/handwriting-cursive.png'), isCursive: false },
];

export const mockAddons = [
    { id: 'ad1', name: 'Polaroid Photo', price: 99, type: 'photo', image: getCloudinaryUrl('/images/addon-flowers.png') },
    { id: 'ad2', name: 'Dried Flower', price: 149, type: 'gift', image: getCloudinaryUrl('/images/addon-flowers.png') },
    { id: 'ad3', name: 'Wax Seal', price: 49, type: 'custom', image: getCloudinaryUrl('/images/addon-flowers.png') },
    { id: 'ad4', name: 'Chocolates', price: 199, type: 'gift', image: getCloudinaryUrl('/images/addon-flowers.png') },
    { id: 'ad5', name: 'Premium Gift Box', price: 299, type: 'packaging', image: getCloudinaryUrl('/images/addon-flowers.png') },
    { id: 'ad6', name: 'Rose Petals', price: 99, type: 'decoration', image: getCloudinaryUrl('/images/addon-flowers.png') },
];

export const mockApi = {
    getProducts: async () => mockPapers,
    getPerfumes: async () => mockPerfumes,
    getHandwritingStyles: async () => mockHandwritings,
    getAddons: async () => mockAddons,

    createOrder: async (orderData: any) => {
        console.log('Mock Order Created:', orderData);
        return {
            id: 'ord_' + Math.random().toString(36).substr(2, 9),
            status: 'pending_payment',
            ...orderData
        };
    }
};
