const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    title: { type: String, required: [true, 'Review title is required'], maxlength: 100 },
    comment: { type: String, required: [true, 'Review comment is required'], maxlength: 1000 },
    images: [{ url: String, publicId: String }],
    isApproved: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    adminReply: {
      comment: String,
      repliedAt: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Prevent duplicate reviews per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function () {
  return this.helpfulVotes ? this.helpfulVotes.length : 0;
});

// Static: update product average rating
reviewSchema.statics.updateProductRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.updateProductRatings(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
