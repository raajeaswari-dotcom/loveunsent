// Mock API Client for Frontend Development
// This allows the frontend to be built and tested without a running backend.

export const mockPapers = [
    { id: 'p1', name: 'Premium Ivory Paper', type: 'paper', price: 150, image: '/images/paper-ivory.png', description: 'Luxurious ivory paper, 120gsm.' },
    { id: 'p2', name: 'Vintage Parchment', type: 'paper', price: 200, image: '/images/paper-parchment.png', description: 'Aged look for a classic feel.' },
];

export const mockPerfumes = [
    { id: 'pf1', name: 'Rose Garden', price: 50, image: '/images/perfume-rose.png' },
    { id: 'pf2', name: 'Sandalwood', price: 60, image: '/images/perfume-rose.png' },
];

export const mockHandwritings = [
    { id: 'hw1', name: 'Elegant Cursive', image: '/images/handwriting-cursive.png', isCursive: true },
    { id: 'hw2', name: 'Neat Print', image: '/images/handwriting-cursive.png', isCursive: false },
];

export const mockAddons = [
    { id: 'ad1', name: 'Polaroid Photo', price: 99, type: 'photo', image: '/images/addon-flowers.png' },
    { id: 'ad2', name: 'Dried Flower', price: 149, type: 'gift', image: '/images/addon-flowers.png' },
    { id: 'ad3', name: 'Wax Seal', price: 49, type: 'custom', image: '/images/addon-flowers.png' },
    { id: 'ad4', name: 'Chocolates', price: 199, type: 'gift', image: '/images/addon-flowers.png' },
    { id: 'ad5', name: 'Premium Gift Box', price: 299, type: 'packaging', image: '/images/addon-flowers.png' },
    { id: 'ad6', name: 'Rose Petals', price: 99, type: 'decoration', image: '/images/addon-flowers.png' },
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
