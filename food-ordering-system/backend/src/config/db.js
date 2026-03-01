const { Sequelize } = require("sequelize");
require('dotenv').config();

/**
 * read environment variables from .env file
 * docker compose will override
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || "food_ordering",
  process.env.DB_USER || "dbeaver",
  process.env.DB_PASSWORD || "dbeaver123",
  {
    // Docker Compose host set to "db"
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
      // MariaDB timezone
      connectTimeout: 60000 
    }
  }
);

module.exports = sequelize;