const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verifyUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for verification');
        
        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} | Role: ${u.role} | Phone: ${u.phone} | Email: ${u.email}`);
        });
        
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyUsers();
