const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * User Registration Controller
 * 
 * POST /auth/register
 * Request body: { username, email, password, confirmPassword }
 * 
 * Process:
 * 1. Validate input fields
 * 2. Check if email already exists in database
 * 3. Hash password using bcrypt with salt rounds of 10
 * 4. Create new user in database
 * 5. Return success message with user data (without password)
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // ===== INPUT VALIDATION =====
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // ===== CHECK IF USER ALREADY EXISTS =====
    // Sequelize query: SELECT * FROM users WHERE email = ?
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.'
      });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({
      where: { username: username }
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken. Please choose a different username.'
      });
    }

    // ===== HASH PASSWORD =====
    // Using bcrypt with 10 salt rounds for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== CREATE USER IN DATABASE =====
    // SQL equivalent: INSERT INTO users (username, email, password, role, created_at, updated_at) 
    //                 VALUES (?, ?, ?, 'customer', NOW(), NOW())
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: 'customer'
    });

    // Remove password from response
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. You can now login.',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * User Login Controller
 * 
 * POST /auth/login
 * Request body: { email, password }
 * 
 * Process:
 * 1. Validate input fields
 * 2. Query database for user by email
 * 3. Compare provided password with hashed password using bcrypt
 * 4. Generate JWT token with userId and role
 * 5. Return token and user information
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===== INPUT VALIDATION =====
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // ===== CHECK IF USER EXISTS =====
    // Sequelize query: SELECT * FROM users WHERE email = ?
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== COMPARE PASSWORDS =====
    // Using bcrypt.compare to securely compare plain password with hashed password
    // This prevents timing attacks by using constant-time comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== GENERATE JWT TOKEN =====
    // Token includes: userId, role, email
    // Expires in 2 hours for security
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      {
        expiresIn: '2h',
        algorithm: 'HS256'
      }
    );

    // Remove password from response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token: token,
      expiresIn: 7200 // 2 hours in seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get User Profile Controller
 * 
 * GET /auth/profile
 * Requires: Valid JWT token in Authorization header
 * 
 * Returns user information based on JWT token
 */
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const userId = req.user.userId;

    // Sequelize query: SELECT * FROM users WHERE id = ?
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout Controller
 * 
 * POST /auth/logout
 * Client-side: Delete token from localStorage/sessionStorage
 * Server-side: Just send success response (JWT is stateless)
 */
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from your client.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout'
    });
  }
};