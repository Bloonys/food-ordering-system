const fs = require('fs');
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
    console.error(err); 
    res.status(500).json({ error: 'Failed to create food' });
  }
};

// Read All
exports.getFoods = async (req, res) => {
  const foods = await Food.findAll();
  res.json(foods);
};

// Read One
exports.getFoodById = async (req, res) => {
  const food = await Food.findByPk(req.params.id);

  if (!food) return res.status(404).json({ error: 'Not found' });

  res.json(food);
};

// Update
// Update
exports.updateFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    
    // 1. 获取旧数据
    const oldFood = await Food.findByPk(req.params.id);
    if (!oldFood) return res.status(404).json({ error: 'Not found' });

    let imagePath = oldFood.image; // 默认保留旧路径

    // 2. 如果有新文件上传
    if (req.file) {
      // 删除旧的物理文件
      if (oldFood.image) {
        const oldFileName = oldFood.image.replace(/^\/uploads\//, '');
        const oldFilePath = path.join(__dirname, '../../uploads', oldFileName);
        try {
          await fs.unlink(oldFilePath);
        } catch (e) { console.warn("Old file not found, skipping unlink"); }
      }
      // 设置新路径
      imagePath = `/uploads/${req.file.filename}`;
    }

    // 3. 更新数据库
    await Food.update(
      { name, price, category, image: imagePath, description },
      { where: { id: req.params.id } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// Delete
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ error: 'Not found' });
    }

    // 如果有图片，删除物理文件
    if (food.image) {
      // 你数据库存的是 "/uploads/xxx.jpg"
      const filePath = path.join(__dirname, '../../uploads', fileName);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    // 删除数据库记录
    await food.destroy();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};