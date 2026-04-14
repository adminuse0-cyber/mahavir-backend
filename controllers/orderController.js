const Order = require('../models/Order');
const nodemailer = require('nodemailer');

const createOrder = async (req, res) => {
  try {
    const { name, email, phone, address, paymentMethod, items, subtotal, discount, finalTotal } = req.body;

    const order = new Order({
      name,
      email,
      phone,
      address,
      paymentMethod,
      items,
      subtotal,
      discount,
      finalTotal
    });

    const savedOrder = await order.save();

    // Send email logic
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL || 'dummy@gmail.com',
        pass: process.env.SMTP_PASS || 'dummypass',
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });

    let itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Mahavir Creation" <adminuse0@gmail.com>`,
      to: email,
      bcc: 'adminuse0@gmail.com', // Admin copy
      subject: `Order Confirmation - Mahavir Creation (#${savedOrder._id})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2ecc71;">Thank you for your order, ${name}!</h2>
          <p>We've successfully received your order and are processing it.</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${savedOrder._id}</p>
          <p><strong>Delivery Address:</strong> ${address}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
            ${itemsHtml}
          </table>
          
          <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> ₹${subtotal.toLocaleString('en-IN')}</p>
            ${discount > 0 ? `<p style="color: #27ae60;"><strong>Online Discount (10%):</strong> -₹${discount.toLocaleString('en-IN')}</p>` : ''}
            <h3 style="color: #2c3e50;"><strong>Final Total:</strong> ₹${finalTotal.toLocaleString('en-IN')}</h3>
          </div>
          
          <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
            If you have any questions, please reply to this email.
          </p>
        </div>
      `
    };

    // Attempt to send email in background (Do not await!)
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASS) {
      transporter.sendMail(mailOptions)
        .then(() => console.log('Order email sent to', email))
        .catch((mailError) => console.error('Error sending email:', mailError));
    } else {
       console.log('No valid SMTP details found. Email sending skipped. Output would be:');
       console.log(mailOptions.html);
    }

    res.status(201).json({ message: 'Order placed successfully', orderId: savedOrder._id });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while placing order' });
  }
};

module.exports = {
  createOrder
};
