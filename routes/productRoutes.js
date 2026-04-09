const express = require('express');
const router = express.Router();
const {
    saveOrUpdateProduct,
    getAllProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, saveOrUpdateProduct);
router.get('/', getAllProducts);

module.exports = router;
