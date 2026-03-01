const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs'); // 新增：用于确保上传目录存在
require('dotenv').config();

const sequelize = require("./config/db");
// 建议：模型和路由引入保持一致的命名风格
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const foodRoutes = require("./routes/foodRoutes");
const initCronJobs = require('./utils/cronjob');

const app = express();

// 🚀 启动定时任务
initCronJobs();

// ===== 目录初始化 =====
// 在 Docker 容器中自动创建 uploads 文件夹，防止静态资源映射报错
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== MIDDLEWARE =====
// Docker 优化：生产环境和开发环境的跨域处理
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:4200",
  "http://localhost" // Nginx 默认端口
];

app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求 (比如移动端或 curl)
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
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);

// 静态文件服务
app.use('/uploads', express.static(uploadDir));

// ===== DATABASE INITIALIZATION =====
// 封装成函数，便于在 Docker 中可能的重试逻辑
const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Docker 环境建议：初次运行用 alter: true，稳定后改回 false
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database models synchronized');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    // 在 Docker 中，如果数据库还没启动好，后端可能会崩溃退出
    // Docker Compose 的 restart: always 会负责重启它
    process.exit(1); 
  }
};
initDb();

app.get("/", (req, res) => {
  res.json({
    message: "🍕 Food Ordering System Backend",
    version: "1.0.0",
    status: "running",
    db_host: process.env.DB_HOST // 方便排查 Docker 环境变量是否注入
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error("Error:", err.stack); // 打印堆栈信息更有利于 Docker 调试
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
});
