const mongoose = require('mongoose');

const merchantBillLineSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    category: { type: String, required: true },
    subProduct: { type: String, required: true },
    unitPrice: { type: Number, required: true, default: 0 },
    qty: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },
});

const merchantBillSchema = mongoose.Schema(
    {
        merchantUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        merchantName: { type: String, required: true },
        merchantPhone: { type: String, required: true },
        billType: { type: String, required: true }, // 'buy' or 'sale'
        material: { type: String, required: true }, // 'raw' or 'ready'
        grandTotal: { type: Number, required: true, default: 0 },
        lines: [merchantBillLineSchema],
    },
    { timestamps: true }
);

const MerchantBill = mongoose.model('MerchantBill', merchantBillSchema);

module.exports = MerchantBill;
