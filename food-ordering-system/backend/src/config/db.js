const { Sequelize } = require("sequelize");
require('dotenv').config();

/**
 * Sequelize Database Connection Configuration
 * 
 * Connects to MariaDB/MySQL database using environment variables
 * Database Details:
 * - Dialect: MariaDB (MySQL compatible)
 * - Host: localhost (default)
 * - Port: 3306 (default MySQL/MariaDB port)
 * - Database: food_ordering
 * - Credentials: From .env file
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || "food_ordering",
  process.env.DB_USER || "dbeaver",
  process.env.DB_PASSWORD || "dbeaver123",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mariadb",
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;