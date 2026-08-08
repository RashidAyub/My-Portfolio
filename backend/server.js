'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Security middleware ----
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ---- Rate limiting (contact form protection) ----
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});

// ---- Body parsing ----
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ---- Routes ----
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'MIR Portfolio API is running.' });
});

app.use('/api/contact', contactLimiter, contactRoutes);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ---- Global error handler ----
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ---- Start server ----
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] MIR Portfolio API running on port ${PORT}`);
  });
}

start();
