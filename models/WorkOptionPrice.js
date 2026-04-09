const mongoose = require('mongoose');

const workOptionPriceSchema = mongoose.Schema(
    {
        optionName: { type: String, required: true, unique: true },
        price: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

const WorkOptionPrice = mongoose.model('WorkOptionPrice', workOptionPriceSchema);

module.exports = WorkOptionPrice;
