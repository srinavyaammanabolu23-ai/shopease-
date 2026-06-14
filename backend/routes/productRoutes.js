const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  searchProducts, getRecommendations, getBrands, deleteProductImage
} = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes (order matters — specific paths before parameterized ones)
router.get('/search', searchProducts);
router.get('/brands', getBrands);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/admin/all', protect, adminOnly, getProducts); // Admin: see all statuses
router.get('/', optionalAuth, getProducts);
router.get('/:slug', optionalAuth, getProduct);

// Admin CRUD routes
router.post('/', protect, adminOnly, upload.array('images', 10), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateProduct);
router.put('/:id/status', protect, adminOnly, updateProduct); // quick status update
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:publicId', protect, adminOnly, deleteProductImage);

module.exports = router;
