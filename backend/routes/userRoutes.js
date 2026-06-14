const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, changePassword, addAddress, updateAddress,
  deleteAddress, toggleWishlist, getWishlist, getOrderHistory, getAllUsers, getUserById, toggleUserStatus, getAdminStats
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/orders', protect, getOrderHistory);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

// Admin routes
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id/toggle-status', protect, adminOnly, toggleUserStatus);

module.exports = router;
