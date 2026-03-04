const fs = require('fs').promises;
const path = require('path');
const Food = require('../models/food');
const redisClient = require('../config/redis');

/**
 * 辅助函数：清除所有与食物相关的缓存
 * 由于中间件使用的 key 是 cache:/api/foods... 
 * 我们使用模糊匹配删除这些 key
 */
const clearFoodCache = async () => {
  try {
    const keys = await redisClient.keys('cache:/api/foods*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error('Redis Clear Error:', err);
  }
};

// Create
exports.createFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const food = await Food.create({ name, price, category, image, description });
    
    await clearFoodCache(); // 数据变动，清除缓存
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create food' });
  }
};

// Read All
exports.getFoods = async (req, res) => {
  try {
    const foods = await Food.findAll();
    res.json(foods); // 中间件会自动处理缓存写入
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

// Read One
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);
    if (!food) return res.status(404).json({ error: 'Not found' });
    res.json(food); // 中间件会自动处理缓存写入
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

// Update
exports.updateFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const oldFood = await Food.findByPk(req.params.id);
    if (!oldFood) return res.status(404).json({ error: 'Not found' });

    let imagePath = oldFood.image; 
    if (req.file) {
      if (oldFood.image) {
        const oldFileName = path.basename(oldFood.image);
        const oldFilePath = path.join(__dirname, '../../uploads', oldFileName);
        try { await fs.unlink(oldFilePath); } catch (e) { /* ignore */ }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    await Food.update(
      { name, price, category, image: imagePath, description },
      { where: { id: req.params.id } }
    );

    await clearFoodCache(); // 更新后清除缓存
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// Delete 
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);
    if (!food) return res.status(404).json({ error: 'Food item not found' });

    await food.destroy();
    
    await clearFoodCache(); // 删除后清除缓存

    if (food.image) {
      const fileName = path.basename(food.image);
      const filePath = path.join(__dirname, '../../uploads', fileName);
      try { await fs.unlink(filePath); } catch (e) { /* ignore */ }
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cannot delete: Item linked to orders.' });
    }
    res.status(500).json({ error: 'Delete failed' });
  }
};