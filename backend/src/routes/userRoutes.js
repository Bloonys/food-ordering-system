const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * * POST /auth/register
 * - Register a new user
 * * POST /auth/login
 * - Login existing user
 * * POST /auth/logout
 * - Logout (client removes token)
 * - Protected route
 * * GET /auth/profile
 * - Get current user profile
 * - Protected route
 * * PUT /auth/profile
 * - Update user profile (Username, Address, Bank Card)
 * - Protected route
 */

// --- Public routes ---
router.post('/register', userController.register);
router.post('/login', userController.login);

// --- Protected routes (require valid JWT token) ---
router.post('/logout', verifyToken, userController.logout);

// 获取用户信息
router.get('/profile', verifyToken, userController.getProfile);

// 更新用户信息 (这是新增的路由)
// 使用 PUT 方法来符合 RESTful 规范，对应 userController.updateProfile
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;