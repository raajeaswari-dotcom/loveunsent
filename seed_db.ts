
import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Paper } from './src/models/Paper';
import { Handwriting } from './src/models/Handwriting';
import { Perfume } from './src/models/Perfume';
import { Order } from './src/models/Order';
import { Collection } from './src/models/Collection';
import { Addon } from './src/models/Addon';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected.');

        console.log('Clearing database...');
        await User.deleteMany({});
        await Paper.deleteMany({});
        await Handwriting.deleteMany({});
        await Perfume.deleteMany({});
        await Order.deleteMany({});
        await Collection.deleteMany({});
        await Addon.deleteMany({});

        console.log('Seeding Users...');
        const passwordHash = await bcrypt.hash('password123', 10);

        const users = await User.create([
            {
                name: 'Super Admin',
                email: 'superadmin@loveunsent.com',
                passwordHash,
                role: 'super_admin',
                permissions: ['all']
            },
            {
                name: 'Admin User',
                email: 'admin@loveunsent.com',
                passwordHash,
                role: 'admin',
                permissions: ['manage_orders', 'manage_users']
            },
            {
                name: 'Sarah Writer',
                email: 'writer@loveunsent.com',
                passwordHash,
                role: 'writer',
                languages: ['English', 'Hindi']
            },
            {
                name: 'John QC',
                email: 'qc@loveunsent.com',
                passwordHash,
                role: 'qc'
            },
            {
                name: 'Priya Customer',
                email: 'customer@example.com',
                passwordHash,
                role: 'customer',
                addresses: [{
                    street: '123 Green Park',
                    city: 'New Delhi',
                    state: 'Delhi',
                    zip: '110016',
                    country: 'India',
                    isDefault: true
                }]
            },
            // Additional Writers
            {
                name: 'Anjali Sharma',
                email: 'anjali.writer@loveunsent.com',
                passwordHash,
                role: 'writer',
                languages: ['English', 'Hindi', 'Marathi']
            },
            {
                name: 'Rajesh Kumar',
                email: 'rajesh.writer@loveunsent.com',
                passwordHash,
                role: 'writer',
                languages: ['English', 'Tamil', 'Telugu']
            },
            {
                name: 'Meera Patel',
                email: 'meera.writer@loveunsent.com',
                passwordHash,
                role: 'writer',
                languages: ['English', 'Gujarati']
            },
            // Additional QC
            {
                name: 'Vikram Singh',
                email: 'vikram.qc@loveunsent.com',
                passwordHash,
                role: 'qc'
            },
            {
                name: 'Kanika Verma',
                email: 'kanika.qc@loveunsent.com',
                passwordHash,
                role: 'qc'
            },
            // Additional Admins
            {
                name: 'Rahul Admin',
                email: 'rahul.admin@loveunsent.com',
                passwordHash,
                role: 'admin',
                permissions: ['manage_orders', 'view_reports']
            },
            // Additional Customers
            {
                name: 'Amit Desai',
                email: 'amit.desai@example.com',
                passwordHash,
                role: 'customer',
                addresses: [{
                    street: '45 MG Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400001',
                    country: 'India',
                    isDefault: true
                }]
            },
            {
                name: 'Neha Reddy',
                email: 'neha.reddy@example.com',
                passwordHash,
                role: 'customer',
                addresses: [{
                    street: '78 Jubilee Hills',
                    city: 'Hyderabad',
                    state: 'Telangana',
                    zip: '500033',
                    country: 'India',
                    isDefault: true
                }]
            },
            {
                name: 'Sanjay Gupta',
                email: 'sanjay.gupta@example.com',
                passwordHash,
                role: 'customer',
                addresses: [{
                    street: '12 Park Street',
                    city: 'Kolkata',
                    state: 'West Bengal',
                    zip: '700016',
                    country: 'India',
                    isDefault: true
                }]
            },
            {
                name: 'Divya Menon',
                email: 'divya.menon@example.com',
                passwordHash,
                role: 'customer',
                addresses: [{
                    street: '34 Marine Drive',
                    city: 'Kochi',
                    state: 'Kerala',
                    zip: '682001',
                    country: 'India',
                    isDefault: true
                }]
            },
            {
                name: 'Arjun Malhotra',
                email: 'arjun.malhotra@example.com',
                passwordHash,
                role: 'customer',
                addresses: [{
                    street: '56 Brigade Road',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    zip: '560001',
                    country: 'India',
                    isDefault: true
                }]
            }
        ]);

        const [superAdmin, admin, writer, qc, customer] = users;

        console.log('Seeding Products...');
        const papers = await Paper.create([
            { name: 'Premium Ivory', slug: 'premium-ivory', imageUrl: '/images/papers/ivory.jpg', priceExtra: 50, description: 'Classic elegant feel' },
            { name: 'Vintage Parchment', slug: 'vintage-parchment', imageUrl: '/images/papers/parchment.jpg', priceExtra: 100, description: 'Old world charm' }
        ]);

        const styles = await Handwriting.create([
            { name: 'Elegant Cursive', imageUrl: '/images/styles/cursive.jpg', isCursive: true },
            { name: 'Neat Print', imageUrl: '/images/styles/print.jpg', isCursive: false }
        ]);

        const perfumes = await Perfume.create([
            { name: 'Rose Garden', imageUrl: '/images/perfumes/rose.jpg', priceExtra: 30 },
            { name: 'Lavender Mist', imageUrl: '/images/perfumes/lavender.jpg', priceExtra: 30 }
        ]);

        console.log('Seeding Collections...');
        await Collection.create([
            {
                name: 'CLASSIC',
                slug: 'classic',
                description: 'A personal handwritten letter displayed next to its envelope, which has a pink floral stamp.',
                price: 499,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875054/loveunsent/images/clasiic.png',
                category: 'stationery',
                stock: 100
            },
            {
                name: 'OPEN WHEN',
                slug: 'open-when',
                description: 'A bundle of \'Open When\' letters tied with a red ribbon, ready for sending.',
                price: 699,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875074/loveunsent/images/openwhen.png',
                category: 'gift',
                stock: 75
            },
            {
                name: 'UNSENT',
                slug: 'unsent',
                description: 'A person writing a heartfelt \'Unsent Letter\' at a desk, with an envelope nearby.',
                price: 549,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875087/loveunsent/images/UNSENT.png',
                category: 'stationery',
                stock: 90
            },
            {
                name: 'GOOD BYE WITH LOVE',
                slug: 'goodbye-with-love',
                description: 'A heartfelt farewell letter sealed with a kiss mark, resting on a wooden table.',
                price: 599,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875060/loveunsent/images/GOOD%20BYE%20WITH%20LOVE.png',
                category: 'stationery',
                stock: 60
            },
            {
                name: 'WHEN YOU STRUGGLE',
                slug: 'when-you-struggle',
                description: 'A comforting letter with a warm cup of tea and a soft blanket, offering support.',
                price: 649,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875090/loveunsent/images/WHEN%20YOU%20STRUGGLE.png',
                category: 'gift',
                stock: 50
            },
            {
                name: 'TIME CAPSULE',
                slug: 'time-capsule',
                description: 'A vintage box containing letters and keepsakes, ready to be preserved for the future.',
                price: 799,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875085/loveunsent/images/TIME%20CAPSULE.png',
                category: 'gift',
                stock: 40
            },
            {
                name: 'DAILY LITTLE THINGS',
                slug: 'daily-little-things',
                description: 'A collection of small notes and polaroids pinned to a corkboard, celebrating everyday moments.',
                price: 549,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875056/loveunsent/images/DAILY%20LITTLE%20THINGS.png',
                category: 'accessory',
                stock: 70
            },
            {
                name: 'OUR STORY',
                slug: 'our-story',
                description: 'A scrapbook-style open letter with photos and handwritten notes, telling a beautiful love story.',
                price: 849,
                imageUrl: 'https://res.cloudinary.com/djbdj9rax/image/upload/v1763875075/loveunsent/images/OUR%20STORY.png',
                category: 'gift',
                stock: 55
            }
        ]);

        console.log('Seeding Addons...');
        await Addon.create([
            {
                name: 'Polaroid Photos (5 pack)',
                type: 'photo',
                description: 'Add your favorite memories with 5 printed polaroid photos',
                price: 150,
                imageUrl: '/images/addons/polaroid.jpg',
                stock: 200
            },
            {
                name: 'Chocolate Box',
                type: 'gift',
                description: 'Premium handmade chocolates to sweeten your letter',
                price: 200,
                imageUrl: '/images/addons/chocolate.jpg',
                stock: 100
            },
            {
                name: 'Luxury Gift Wrap',
                type: 'packaging',
                description: 'Beautiful premium gift wrapping with silk ribbon',
                price: 100,
                imageUrl: '/images/addons/giftwrap.jpg',
                stock: 150
            },
            {
                name: 'Rose Bouquet',
                type: 'gift',
                description: 'Fresh red roses to accompany your letter',
                price: 300,
                imageUrl: '/images/addons/roses.jpg',
                stock: 50
            }
        ]);

        console.log('Seeding Orders...');
        // 1. Assigned Order (for Writer)
        await Order.create({
            customerId: customer._id,
            paperId: papers[0]._id,
            handwritingStyleId: styles[0]._id,
            perfumeId: perfumes[0]._id,
            message: 'My dearest love, waiting for you...',
            price: 499,
            workflowState: 'assigned',
            fulfillment: { assignedWriter: writer._id },
            shippingAddress: customer.addresses[0]
        });

        // 2. QC Review Order (for QC)
        await Order.create({
            customerId: customer._id,
            paperId: papers[1]._id,
            handwritingStyleId: styles[1]._id,
            message: 'Happy Birthday! Have a blast!',
            price: 599,
            workflowState: 'qc_review',
            fulfillment: { assignedWriter: writer._id, writerSubmissionUrl: 'http://example.com/letter.jpg' },
            shippingAddress: customer.addresses[0]
        });

        // 3. Delivered Order (for Revenue Stats)
        await Order.create({
            customerId: customer._id,
            paperId: papers[0]._id,
            handwritingStyleId: styles[0]._id,
            message: 'Thank you for everything.',
            price: 450,
            workflowState: 'delivered',
            payment: { status: 'captured', paidAt: new Date() },
            fulfillment: { assignedWriter: writer._id, deliveredAt: new Date() },
            shippingAddress: customer.addresses[0]
        });

        console.log('Database seeded successfully!');
        console.log('--------------------------------');
        console.log('Credentials (password: password123):');
        console.log('Super Admin: superadmin@loveunsent.com');
        console.log('Admin:       admin@loveunsent.com');
        console.log('Writer:      writer@loveunsent.com');
        console.log('QC:          qc@loveunsent.com');
        console.log('Customer:    customer@example.com');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
