const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * 
 * POST /auth/register
 * - Register a new user
 * - Body: { username, email, password, confirmPassword }
 * 
 * POST /auth/login
 * - Login existing user
 * - Body: { email, password }
 * - Response: { token, user, expiresIn }
 * 
 * POST /auth/logout
 * - Logout (client removes token)
 * - Protected route
 * 
 * GET /auth/profile
 * - Get current user profile
 * - Protected route (requires valid JWT token)
 */

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require valid JWT token)
router.post('/logout', verifyToken, userController.logout);
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;