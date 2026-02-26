const fs = require('fs').promises; // 使用 promise 版本的 fs
const path = require('path');
const Food = require('../models/food');

// Create
exports.createFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const food = await Food.create({ name, price, category, image, description });
    res.json(food);
  } catch (err) {
    console.error('Create Error:', err); 
    res.status(500).json({ error: 'Failed to create food' });
  }
};

// Read All
exports.getFoods = async (req, res) => {
  try {
    const foods = await Food.findAll();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

// Read One
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);
    if (!food) return res.status(404).json({ error: 'Not found' });
    res.json(food);
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
        // 修复：解析文件名
        const oldFileName = path.basename(oldFood.image);
        const oldFilePath = path.join(__dirname, '../../uploads', oldFileName);
        try {
          await fs.unlink(oldFilePath);
        } catch (e) { console.warn("Old file not found, skipping"); }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    await Food.update(
      { name, price, category, image: imagePath, description },
      { where: { id: req.params.id } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// Delete 
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // 1. 先尝试删除数据库记录 (如果被订单占用，这里会直接抛出错误跳到 catch)
    // 这样可以防止：数据库没删掉，图片却先被删了
    await food.destroy();

    // 2. 数据库删除成功后，再删除物理图片
    if (food.image) {
      // ✅ 修复：从路径中正确获取文件名
      const fileName = path.basename(food.image);
      const filePath = path.join(__dirname, '../../uploads', fileName);
      
      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.warn("Physical file delete failed or not exists:", filePath);
      }
    }

    res.json({ success: true, message: 'Deleted successfully' });

  } catch (err) {
    console.error('Delete Error details:', err);

    // ✅ 针对外键约束报错的友好提示
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Cannot delete: This food item is linked to existing orders.' 
      });
    }

    res.status(500).json({ error: 'Delete failed due to server error' });
  }
};