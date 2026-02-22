const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const multer = require('multer');
const upload = require('../middleware/upload'); 

router.post('/', upload.single('image'), foodController.createFood);
router.put('/:id', upload.single('image'), foodController.updateFood);
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);
router.delete('/:id', foodController.deleteFood);

module.exports = router;