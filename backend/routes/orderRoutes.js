const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus, getOrderAnalytics
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/analytics', protect, adminOnly, getOrderAnalytics);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
