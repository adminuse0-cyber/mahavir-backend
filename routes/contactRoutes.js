const express = require('express');
const router = express.Router();
const {
    addContact,
    getAllContacts
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', addContact);
router.get('/', protect, getAllContacts);

module.exports = router;
