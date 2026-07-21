import jwt from 'jsonwebtoken';

// JWT Authentication Middleware - reads from cookies
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie (first priority) or header (fallback)
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    // The token was generated with userId or id, handle both safely
    const User = (await import('../models/User.js')).default;
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked.' });
    }
    
    req.user = user; // Attach user info to request
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Token expired.' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Authentication error.' 
    });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};