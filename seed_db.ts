
import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Paper } from './src/models/Paper';
import { Handwriting } from './src/models/Handwriting';
import { Perfume } from './src/models/Perfume';
import { Order } from './src/models/Order';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

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
