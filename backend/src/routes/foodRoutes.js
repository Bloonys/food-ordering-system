const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middleware/upload');

const verifyToken = require('../middleware/verifyToken');
const adminOnly = require('../middleware/adminOnly');

// ===== ADMIN ONLY CRUD =====
router.post('/', verifyToken, adminOnly, upload.single('image'), foodController.createFood);
router.put('/:id', verifyToken, adminOnly, upload.single('image'), foodController.updateFood);
router.delete('/:id', verifyToken, adminOnly, foodController.deleteFood);

// ===== PUBLIC READ (如果你想公开列表) =====
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);

module.exports = router;