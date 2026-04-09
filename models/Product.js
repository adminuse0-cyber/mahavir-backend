const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        category: { type: String, required: true },
        name: { type: String, required: true },
        priceBuyRaw: { type: Number, required: true, default: 0 },
        priceBuyReady: { type: Number, required: true, default: 0 },
        priceSaleRaw: { type: Number, required: true, default: 0 },
        priceSaleReady: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
