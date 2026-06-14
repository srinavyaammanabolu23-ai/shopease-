const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null }, // max discount for percentage type
    maxUses: { type: Number, default: null }, // null = unlimited
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

couponSchema.virtual('usedCount').get(function () {
  return this.usedBy ? this.usedBy.length : 0;
});

couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

couponSchema.virtual('isUsageLimitReached').get(function () {
  if (!this.maxUses) return false;
  return this.usedBy.length >= this.maxUses;
});

module.exports = mongoose.model('Coupon', couponSchema);
