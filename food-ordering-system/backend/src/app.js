const express = require("express");
const cors = require("cors");
require('dotenv').config();
const sequelize = require("./config/db");
const User = require("./models/user");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ===== MIDDLEWARE =====
// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4200",
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

//food 
const foodRoutes = require("./routes/foodRoutes");

app.use("/api/foods", foodRoutes);

// Serve uploaded images from the 'uploads' directory
const path = require('path');

// 替换 app.js 里的那行
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ===== DATABASE INITIALIZATION =====
// Sync Sequelize models with database
// This will create tables if they don't exist
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Sync models (creates tables if they don't exist)
    // Set force: true to drop and recreate tables on each startup (development only)
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
})();

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.json({
    message: "🍕 Food Ordering System Backend",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/auth/register, /auth/login, /auth/profile (protected)",
      products: "/products",
      orders: "/orders"
    }
  });
});

// User authentication routes
app.use("/auth", userRoutes);

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - Register: POST http://localhost:${PORT}/auth/register`);
  console.log(`   - Login: POST http://localhost:${PORT}/auth/login`);
  console.log(`   - Profile: GET http://localhost:${PORT}/auth/profile (requires token)\n`);
});

