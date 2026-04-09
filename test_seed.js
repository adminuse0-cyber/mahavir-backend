const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');
        
        await User.deleteMany({});
        console.log('Cleared all users');

        const u = await User.create({
            name: 'Test',
            phone: '123',
            password: '123',
            role: 'Admin'
        });
        console.log('Created user:', u._id);

        const found = await User.find({});
        console.log('Post-seed count:', found.length);
        
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testSeed();
