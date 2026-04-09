const mongoose = require('mongoose');

const workSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: { type: String, required: true }, // Store as string 'YYYY-MM-DD' as per original
        workType: { type: String, required: true },
        subProduct: { type: String, default: '' },
        workOption: { type: String, required: true },
        quantity: { type: Number, required: true, default: 0 },
        price: { type: Number, required: true, default: 0 },
        totalSalary: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

const Work = mongoose.model('Work', workSchema);

module.exports = Work;
