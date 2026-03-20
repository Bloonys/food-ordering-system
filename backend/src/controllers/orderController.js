const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Food = require('../models/food');
const socketConfig = require('../config/socket');

/**
 * Create Order
 */
exports.createOrder = async (req, res) => {
  // Trace 1: Request received
  console.log('--- 🚀 [OrderController] Starting new order creation ---');
  
  try {
    const { items } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      console.warn('⚠️ [OrderController] Cart is empty');
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let total = 0;
    const orderItems = [];

    // Trace 2: Validate Food IDs and calculate price
    for (const item of items) {
      const food = await Food.findByPk(item.foodId);
      if (!food) {
        console.error(`❌ [OrderController] Food ID not found: ${item.foodId}`);
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

    // Trace 3: Create main Order entry
    const order = await Order.create({
      user_id: userId,
      total_amount: total,
      status: 'pending'
    });
    console.log(`✅ [OrderController] Main order created, ID: ${order.id}`);

    // Trace 4: Bind order_id and bulk create Order Items
    const finalItems = orderItems.map(oi => ({ ...oi, order_id: order.id }));
    await OrderItem.bulkCreate(finalItems);
    console.log('✅ [OrderController] Order items bulk inserted successfully');

    // Trace 5: Core logic - Trigger Socket notification
    try {
        console.log('📡 [OrderController] Attempting to retrieve Socket instance...');
        const io = socketConfig.getIO();
        
        if (io) {
            console.log(`📡 [OrderController] Broadcasting 'new-order' event...`);
            io.emit('new-order', {
              orderId: order.id,
              total: total,
              customer: userId,
              time: new Date()
            });
            console.log('🌈 [OrderController] Socket broadcast action completed!');
        } else {
            console.error('❌ [OrderController] Failed to get Socket instance (io is null)');
        }
    } catch (socketErr) {
        // Log specific error if Socket fails
        console.error('❌ [OrderController] Socket broadcast failed:', socketErr.message);
    }

    // Trace 6: Final response
    console.log('🏁 [OrderController] Request processing finished, sending response');
    return res.json({ orderId: order.id, total });

  } catch (err) {
    // Trace 7: Global error catch
    console.error('🔥 [OrderController] Fatal error occurred:', err);
    return res.status(500).json({ message: 'Order creation failed', error: err.message });
  }
};

/**
 * Get User Orders (Admin sees all, User sees their own)
 */
exports.getOrders = async (req, res) => {
  try {
    // 假设你的 JWT 中间件在 req.user 中存了角色信息（例如 role: 'admin'）
    const { userId, role } = req.user; 

    let queryOptions = {
      order: [['created_at', 'DESC']]
    };

    // 如果不是管理员，才添加 user_id 过滤条件
    if (role !== 'admin') {
      queryOptions.where = { user_id: userId };
      console.log(`ℹ️ [OrderController] Fetching orders for user: ${userId}`);
    } else {
      console.log(`👑 [OrderController] Admin detected, fetching ALL orders`);
    }

    const orders = await Order.findAll(queryOptions);
    res.json(orders);
  } catch (err) {
    console.error('❌ [OrderController] Failed to fetch orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};