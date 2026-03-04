const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * User Model
 * Represents a user in the food ordering system
 * 
 * Fields:
 * - id: Primary key (auto-incremented)
 * - username: Unique username
 * - email: Unique email address
 * - password: Hashed password using bcrypt
 * - role: User role (customer, admin, driver) - defaults to 'customer'
 * - created_at: Timestamp when user was created
 * - updated_at: Timestamp when user was last updated
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 100],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin', 'driver'),
    defaultValue: 'customer',
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT, // 地址可能很长，建议用 TEXT
    allowNull: true
  },
  bank_card: { // 建议后端数据库字段用下划线风格
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, 
{
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}

);

module.exports = User;
