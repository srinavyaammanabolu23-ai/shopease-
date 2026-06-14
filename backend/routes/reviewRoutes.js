const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, markHelpful, getAllReviews, updateReviewStatus, deleteReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, upload.array('images', 3), createReview);
router.post('/:id/helpful', protect, markHelpful);
router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id/status', protect, adminOnly, updateReviewStatus);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
