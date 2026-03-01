const { Sequelize } = require("sequelize");
require('dotenv').config();

/**
 * 修改逻辑：
 * 1. 优先读取环境变量，方便 Docker 注入
 * 2. 默认值作为本地开发兜底
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || "food_ordering",
  process.env.DB_USER || "dbeaver",
  process.env.DB_PASSWORD || "dbeaver123",
  {
    // 在 Docker Compose 中，这里会被设置为 "db"
    host: process.env.DB_HOST || "localhost", 
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mariadb",
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // 某些 MariaDB 版本在 Docker 中需要这个配置来处理时区或字符集
      connectTimeout: 60000 
    }
  }
);

module.exports = sequelize;