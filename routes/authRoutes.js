const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    authUser, 
    getAllUsers, 
    getUserProfile, 
    updateUserProfile, 
    updateUserPassword,
    getDBStatus,
    forgotPassword,
    resetPassword,
    setupDatabase,
    deleteUser,
    updateUserByAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/health', getDBStatus);
router.get('/setup-db', setupDatabase);
router.get('/users', protect, getAllUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, updateUserPassword);
router.delete('/:id', protect, deleteUser);
router.put('/:id', protect, updateUserByAdmin);

module.exports = router;
