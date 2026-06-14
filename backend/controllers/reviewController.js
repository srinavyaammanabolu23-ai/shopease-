const Review = require('../models/Review');
const Order = require('../models/Order');
const { paginate, paginationResult, uploadMultipleImages } = require('../utils/helpers');

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = { product: req.params.productId, isApproved: true };
    if (rating) query.rating = parseInt(rating);

    const [reviews, total, ratingBreakdown] = await Promise.all([
      Review.find(query)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(lim)
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), reviews, ratingBreakdown });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment, orderId } = req.body;

    // Check if already reviewed
    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if user purchased this product
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'delivered' });
      if (order) isVerifiedPurchase = true;
    }

    const reviewData = { product, user: req.user._id, rating: parseInt(rating), title, comment, isVerifiedPurchase, isApproved: false };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const results = await uploadMultipleImages(req.files, 'ecommerce/reviews');
      reviewData.images = results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
    }

    const review = await Review.create(reviewData);
    res.status(201).json({ success: true, message: 'Review submitted! It will be visible after approval.', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const index = review.helpfulVotes.indexOf(req.user._id);
    if (index > -1) {
      review.helpfulVotes.splice(index, 1);
    } else {
      review.helpfulVotes.push(req.user._id);
    }

    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulVotes.length });
  } catch (error) {
    next(error);
  }
};

// ====== ADMIN ======

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Admin
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved, search } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { comment: { $regex: search, $options: 'i' } }];

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email avatar')
        .populate('product', 'name images slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Review.countDocuments(query),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject review (Admin)
// @route   PUT /api/reviews/:id/status
// @access  Admin
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { isApproved, adminReply } = req.body;
    const updateData = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (adminReply) updateData.adminReply = { comment: adminReply, repliedAt: new Date() };

    const review = await Review.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'name')
      .populate('product', 'name _id');

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Update product ratings if status changed
    if (isApproved !== undefined) {
      await Review.updateProductRatings(review.product._id);
    }

    res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'rejected'}`, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await Review.updateProductRatings(review.product);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
