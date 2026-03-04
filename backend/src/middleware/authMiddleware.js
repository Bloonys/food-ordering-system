const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware
 * 
 * This middleware verifies the JWT token from the Authorization header
 * and attaches the decoded token data to req.user
 * 
 * Usage:
 * router.get('/protected-route', verifyToken, controllerFunction);
 * 
 * Expected header format:
 * Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    // Extract token from "Bearer <token>" format
    // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>'
      });
    }

    const token = tokenParts[1];

    // Verify JWT token
    // Throws error if token is invalid or expired
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      {
        algorithms: ['HS256']
      }
    );

    // Attach decoded token to request object for use in controllers
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Token verification error:', error.message);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred during token verification'
    });
  }
};

module.exports = verifyToken;