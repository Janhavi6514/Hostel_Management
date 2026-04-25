const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────

// Security headers
app.use(helmet());

// ✅ FIXED CORS (IMPORTANT)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // 🔥 PATCH ADDED
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ✅ HANDLE PREFLIGHT REQUESTS (VERY IMPORTANT FOR PATCH)
app.options('*', cors());

// Request logging (dev mode)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// Health check (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hostel Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// All API routes prefixed with /api
app.use('/api', routes);

// ─────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;