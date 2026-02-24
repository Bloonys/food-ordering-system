const sequelize = require('../config/db');

const User = require('./user');
const Food = require('./food');
const Order = require('./order');
const OrderItem = require('./orderItem');

// 关联关系
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Food.hasMany(OrderItem, { foreignKey: 'food_id' });
OrderItem.belongsTo(Food, { foreignKey: 'food_id' });

module.exports = {
  sequelize,
  User,
  Food,
  Order,
  OrderItem
};