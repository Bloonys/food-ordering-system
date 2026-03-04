const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sequelize = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const foodRoutes = require("./routes/foodRoutes");
const initCronJobs = require('./utils/cronjob');
const models = require('./models/index');

const app = express();

// cron job
initCronJobs();

// ===== 目录初始化与静态资源配置 =====
/**
 * 根据 Dockerfile (WORKDIR /usr/src/app)
 * process.cwd() 会返回 /usr/src/app
 */
const uploadDir = path.resolve(process.cwd(), 'uploads');

// make sure uploads directory exists
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads directory at:', uploadDir);
} else {
    console.log('✅ Uploads directory found at:', uploadDir);
}

// ===== MIDDLEWARE =====
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:4200",
  "http://localhost"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ===== ROUTES =====
// api
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);

// same path as frontend proxy
app.use('/api/uploads', express.static(uploadDir));

// ===== DATABASE INITIALIZATION =====
// ===== DATABASE INITIALIZATION =====
const initDb = async () => {
  try {
    // 使用 models 导出的 sequelize 实例
    await models.sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // 这步会根据 models/index.js 里的关联关系创建外键
    await models.sequelize.sync({ alter: true }); 
    console.log('✓ Database models & associations synchronized');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1); 
  }
};
initDb();

// routes for testing
app.get("/", (req, res) => {
  res.json({
    message: "🍕 Food Ordering System Backend",
    version: "1.0.0",
    status: "running",
    container_upload_path: uploadDir // only for testing 
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📂 Static files served at: http://localhost:${PORT}/api/uploads`);
});