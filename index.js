const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ✅ CORS Setup — Local ane Production dono ma kaam karshe
const allowedOrigins = [
  'http://localhost:5173',       // Local Vite dev server
  'http://localhost:3000',       // Backup local
  process.env.FRONTEND_URL,     // Vercel production URL (env ma set karsho)
].filter(Boolean); // undefined values hatavva maate

app.use(cors({
  origin: function (origin, callback) {
    // Postman/curl jeva tools maate (origin nathi hoto)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: This origin is not allowed'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/work', require('./routes/workRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/test-smtp', async (req, res) => {
    const nodemailer = require('nodemailer');
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            },
            // Force IPv4
            family: 4,
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: process.env.SMTP_EMAIL, // Send to self
            subject: 'Render SMTP Test',
            text: 'This is a test from Render.'
        });

        res.json({ success: true, info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
