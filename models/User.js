const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, default: '' },
        phone: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: 'worker' },
        address: { type: String, default: '' },
        dob: { type: Date },
        age: { type: Number },
        experience: { type: String, default: '' },
        hours: { type: Number },
        skills: { type: String, default: '' },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
