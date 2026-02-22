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
exports.updateFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const image = req.file ? req.file.filename : req.body.image;

    await Food.update(
      { name, price, category, image, description },
      { where: { id: req.params.id } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// Delete
exports.deleteFood = async (req, res) => {
  await Food.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};