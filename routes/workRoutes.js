const express = require('express');
const router = express.Router();
const {
    getWorkOptionPrices,
    setWorkOptionPrice,
    addWork,
    getWorkByUserAndDate,
    getAllWorkEntries,
    updateWorkEntry,
    deleteWorkEntry,
    getWorkSummaryByRange
} = require('../controllers/workController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getWorkSummaryByRange);
router.get('/options', getWorkOptionPrices);
router.post('/options', protect, setWorkOptionPrice);
router.post('/', protect, addWork);
router.get('/user', protect, getWorkByUserAndDate);
router.get('/', protect, getAllWorkEntries);
router.put('/:id', protect, updateWorkEntry);
router.delete('/:id', protect, deleteWorkEntry);

module.exports = router;
