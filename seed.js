const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seed');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedUsers = async () => {
    await connectDB();

    try {
        // Remove old Admin and CEO accounts to ensure fresh credentials
        await User.deleteMany({ role: { $in: ['Admin', 'CEO', 'CEO / Owner'] } });
        console.log('Old Admin and CEO accounts removed.');

        // Also remove accounts with the specific phone numbers we are about to use
        await User.deleteMany({ phone: { $in: ['9586780968', '9879272162', 'admin', 'ceo'] } });

        // Create Admin
        await User.create({
            name: 'Admin User',
            phone: '9586780968',
            email: 'adminuse0@gmail.com',
            password: 'Admin@123',
            role: 'Admin'
        });
        console.log('Admin user created (phone: 9586780968, email: adminuse0@gmail.com, password: Admin@123)');

        // Create CEO
        await User.create({
            name: 'CEO User',
            phone: '9879272162',
            email: 'adminuse0@gmail.com',
            password: 'Ceo@123',
            role: 'CEO / Owner'
        });
        console.log('CEO user created (phone: 9879272162, email: adminuse0@gmail.com, password: Ceo@123)');

        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();
