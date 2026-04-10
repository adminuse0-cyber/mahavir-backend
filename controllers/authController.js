const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id, phone, role, name) => {
    return jwt.sign({ id, phone, role, name }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { name, email, phone, password, role, address, dob, age, experience, hours, skills } = req.body;

    // For simplicity we store plain text password as in original PHP app
    // In a real app we'd hash it, but sticking to "same to same" unless specified

    try {
        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: 'Mobile number already registered' });
        }

        if (email) {
            const emailAndRoleExists = await User.findOne({ email, role });
            if (emailAndRoleExists) {
                return res.status(400).json({ message: `Email already registered as ${role}` });
            }
        }

        let extra = {};
        if (role === 'Worker') {
            extra = { address, dob, age, experience, hours, skills };
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            ...extra
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id, user.phone, user.role, user.name),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const authUser = async (req, res) => {
    const { identifier, role, password } = req.body;
    
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Identifier received:', `"${identifier}"`);
    console.log('Role selected:', `"${role}"`);
    console.log('Password received (check case):', `"${password}"`);

    try {
        const trimmedIdentifier = identifier.trim();
        
        // Find user by phone OR email + role + password
        const user = await User.findOne({ 
            $or: [
                { phone: trimmedIdentifier }, 
                { email: trimmedIdentifier }
            ], 
            role: role, 
            password: password 
        });

        if (user) {
            console.log('SUCCESS: User found!', user.name);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id, user.phone, user.role, user.name),
            });
        } else {
            console.log('FAILURE: No user matched these credentials and role in database.');
            
            // Debugging / Better Error Messaging
            const userByIdentifier = await User.findOne({ 
                $or: [{ phone: trimmedIdentifier }, { email: trimmedIdentifier }] 
            });

            if (!userByIdentifier) {
                return res.status(401).json({ message: 'No account found with this mobile number or email.' });
            }

            if (userByIdentifier.role !== role) {
                return res.status(401).json({ message: `This account is registered as ${userByIdentifier.role}, not ${role}.` });
            }

            if (userByIdentifier.password !== password) {
                return res.status(401).json({ message: 'Incorrect password. Please try again.' });
            }

            res.status(401).json({ message: 'Invalid credentials or role' });
        }
    } catch (error) {
        console.error('SERVER ERROR during login:', error);
        res.status(500).json({ message: error.message });
    }
};

const getDBStatus = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ 
            status: 'Connected', 
            userCount: count,
            database: mongoose.connection.name
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ _id: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            
            if (user.role === 'Worker') {
                user.dob = req.body.dob || user.dob;
                user.age = req.body.age || user.age;
                user.experience = req.body.experience || user.experience;
                user.hours = req.body.hours || user.hours;
                user.skills = req.body.skills || user.skills;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                token: generateToken(updatedUser._id, updatedUser.phone, updatedUser.role, updatedUser.name),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            if (user.password === oldPassword) {
                user.password = newPassword;
                await user.save();
                res.json({ message: 'Password updated successfully' });
            } else {
                res.status(401).json({ message: 'Invalid old password' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { identifier } = req.body;
    try {
        const user = await User.findOne({ 
            $or: [{ email: identifier }, { phone: identifier }] 
        });

        if (!user) {
            return res.status(404).json({ message: 'No user found with that email/mobile' });
        }

        if (!user.email) {
            return res.status(400).json({ message: 'This account does not have a registered email to send the reset link to.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set resetPasswordToken
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password:</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        <p>This link is only valid for 10 minutes.</p>
        <p>Regards,<br/>Mahavir Creation Team</p>
        `;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: `"Mahavir Creation" <${process.env.SMTP_EMAIL}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: message
        });

        res.json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
};

const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const setupDatabase = async (req, res) => {
    try {
        // Create Admin if not exists
        const adminExists = await User.findOne({ role: 'Admin' });
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                phone: '9586780968',
                email: 'adminuse0@gmail.com',
                password: 'Admin@123',
                role: 'Admin'
            });
        }

        // Create CEO if not exists
        const ceoExists = await User.findOne({ role: 'CEO / Owner' });
        if (!ceoExists) {
            await User.create({
                name: 'CEO User',
                phone: '9879272162',
                email: 'adminuse0@gmail.com',
                password: 'Ceo@123',
                role: 'CEO / Owner'
            });
        }

        res.json({ message: 'Database setup successful! Admin and CEO accounts are ready.' });
    } catch (error) {
        res.status(500).json({ message: 'Setup failed', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Prevent deleting the primary admin or self by accident
            if (user.role === 'Admin' || user.role === 'CEO / Owner' || user.role === 'CEO') {
                if(user._id.toString() !== req.user.id && req.user.role !== 'CEO / Owner' && req.user.role !== 'CEO') {
                    return res.status(403).json({ message: 'Cannot delete an Admin or Owner account.' });
                }
            }
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.role = req.body.role || user.role;
            user.email = req.body.email || user.email;
            
            if (user.role === 'Worker') {
                user.address = req.body.address !== undefined ? req.body.address : user.address;
                user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
                user.age = req.body.age !== undefined ? req.body.age : user.age;
                user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
                user.hours = req.body.hours !== undefined ? req.body.hours : user.hours;
                user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
            }

            const updatedUser = await user.save();
            res.json({ message: 'User updated successfully', updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerUser, 
    authUser, 
    getAllUsers, 
    getUserProfile, 
    updateUserProfile, 
    updateUserPassword,
    getDBStatus,
    forgotPassword,
    resetPassword,
    setupDatabase,
    deleteUser,
    updateUserByAdmin
};
