const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Connect to Database
connectDB();

const app = express();

// Trust proxy settings for Render / reverse proxies (express-rate-limit requirement)
app.set('trust proxy', 1);

// Standard Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://connectsphere-community-learning-frontend.onrender.com',
  'https://connectsphere.anshuman892494.online',
  'https://www.connectsphere.anshuman892494.online'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const url = origin.toLowerCase();
    const isAllowed = allowedOrigins.includes(origin) ||
                      url.endsWith('.onrender.com') ||
                      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log requests
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// Import rate limiters
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const usersRoutes = require('./routes/users.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

// Use rate limiters & routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', apiLimiter, postRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/subscriptions', apiLimiter, subscriptionRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'ConnectSphere API Server is running successfully!' });
});

// Ping endpoint for keep-alive monitoring
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Server is Active' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  }

  // Keep-alive self-ping interval for Render free tier spin-down prevention
  const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  if (selfUrl) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Render Self-Ping Keep-Alive initiated for: ${selfUrl}`);
    }
    // Ping every 10 minutes (600,000 ms) to keep container hot
    setInterval(() => {
      fetch(`${selfUrl}/ping`)
        .then((res) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Self-ping keep-alive successful: status ${res.status}`);
          }
        })
        .catch((err) => {
          console.error(`Self-ping keep-alive failed: ${err.message}`);
        });
    }, 10 * 60 * 1000);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Unhandled Rejection Error: ${err.message}`);
  }
  // Close server & exit process
  server.close(() => process.exit(1));
});
