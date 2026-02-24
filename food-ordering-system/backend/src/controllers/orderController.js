const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Food = require('../models/food');


/**
 * Create Order
 */
exports.createOrder = async (req, res) => {
  try {
    console.log('req.user:', req.user);

    const { items } = req.body;
    const userId = req.user.userId; // from JWT

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findByPk(item.foodId);
      if (!food) {
        return res.status(404).json({ message: `Food not found: ${item.foodId}` });
      }

      const price = food.price;
      const quantity = item.quantity || 1;

      total += price * quantity;

      orderItems.push({
        food_id: food.id,
        quantity,
        price
      });
    }

    const order = await Order.create({
      user_id: userId,
      total_amount: total,
      status: 'pending'
    });

    for (const oi of orderItems) {
      oi.order_id = order.id;
    }

    await OrderItem.bulkCreate(orderItems);

    res.json({ orderId: order.id, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Order creation failed' });
  }
};


/**
 * Get Orders (no include to avoid association issues)
 */
exports.getOrders = async (req, res) => {
  try {
    console.log('req.user:', req.user);

    const orders = await Order.findAll({
      where: { user_id: req.user.userId }
    });

    console.log('orders:', orders);

    res.json(orders);
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};