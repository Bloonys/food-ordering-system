const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const http = require("http"); 
require('dotenv').config();

const socketConfig = require("./config/socket");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const foodRoutes = require("./routes/foodRoutes");
const initCronJobs = require('./utils/cronjob');
const models = require('./models/index');

const app = express();
// 创建 HTTP Server 包装 Express
const httpServer = http.createServer(app);

// cron job
initCronJobs();

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
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
app.use('/api/uploads', express.static(uploadDir));

// ===== DATABASE & SOCKET INITIALIZATION =====
const startServer = async () => {
  try {
    await models.sequelize.authenticate();
    await models.sequelize.sync({ alter: true });
    console.log('✓ Database connected & synced');

    // 初始化 Socket
    socketConfig.init(httpServer, allowedOrigins);

    app.use("/api/foods", foodRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/auth", userRoutes);

    const PORT = process.env.PORT || 3000;
    // 🚩 注意：这里必须使用 httpServer.listen
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📡 WebSocket enabled`);
    });
  } catch (error) {
    console.error('✗ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();

// Error handling...
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});