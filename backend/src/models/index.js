const sequelize = require('../config/db');

const User = require('./user');
const Food = require('./food');
const Order = require('./order');
const OrderItem = require('./orderItem');

// ===== database relationships =====

// (1:N)
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// (1:N)
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE' // 
});
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// (1:N)
Food.hasMany(OrderItem, { foreignKey: 'food_id' });
OrderItem.belongsTo(Food, { foreignKey: 'food_id' });

// (N:M) - 通过 OrderItem 连接 Order 和 Food
Order.belongsToMany(Food, { 
  through: OrderItem, 
  foreignKey: 'order_id', 
  otherKey: 'food_id' 
});
Food.belongsToMany(Order, { 
  through: OrderItem, 
  foreignKey: 'food_id', 
  otherKey: 'order_id' 
});

// ===== exports =====
module.exports = {
  sequelize,
  User,
  Food,
  Order,
  OrderItem
};