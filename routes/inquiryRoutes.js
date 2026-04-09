const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

router.post('/', inquiryController.createInquiry);
router.get('/', inquiryController.getInquiries);
router.patch('/:id/status', inquiryController.updateStatus);

module.exports = router;
