
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function resetPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'superadmin@loveunsent.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({ email });

        if (user) {
            user.passwordHash = hashedPassword;
            await user.save();
            console.log(`Password for ${email} has been reset to: ${password}`);
        } else {
            console.log(`User ${email} not found. Creating new super admin...`);
            await User.create({
                name: 'Super Admin',
                email,
                passwordHash: hashedPassword,
                role: 'super_admin',
                isActive: true
            });
            console.log(`Created new super admin: ${email} / ${password}`);
        }

        await mongoose.disconnect();
        console.log('Done');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();
