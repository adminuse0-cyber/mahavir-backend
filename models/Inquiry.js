const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String },
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  status: { type: String, default: 'Pending' } // Pending, Contacted, Converted
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
