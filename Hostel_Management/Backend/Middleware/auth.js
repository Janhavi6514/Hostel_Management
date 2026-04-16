const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided. Access denied.' });
    }

    // Support "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'Token is missing. Access denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hostel_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Access denied.' });
    }
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Admin only access middleware
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin access only.' });
  }

  next();
};

// Staff or Admin access middleware
const isStaffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }

  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
  }

  next();
};

module.exports = { verifyToken, isAdmin, isStaffOrAdmin };