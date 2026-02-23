const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware
 * 验证登录 token
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { algorithms: ['HS256'] }
    );

    // 把用户信息挂到 req.user
    req.user = decoded;

    next();
  } catch (err) {
    console.error('Token error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyToken;