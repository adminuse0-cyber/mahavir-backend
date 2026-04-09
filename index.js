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

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
