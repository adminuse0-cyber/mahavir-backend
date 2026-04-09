const express = require('express');
const router = express.Router();
const {
    createBill,
    getAllBills,
    getBill,
    updateBillLine,
    deleteBill
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBill);
router.get('/', protect, getAllBills);
router.get('/:id', protect, getBill);
router.put('/line', protect, updateBillLine);
router.delete('/:id', protect, deleteBill);

module.exports = router;
