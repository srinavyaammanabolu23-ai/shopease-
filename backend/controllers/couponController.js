const Coupon = require('../models/Coupon');
const { paginate, paginationResult } = require('../utils/helpers');

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, active, search } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (search) query.code = { $regex: search, $options: 'i' };

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Coupon.countDocuments(query),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon (Public - for cart)
// @route   GET /api/coupons/validate/:code
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (coupon.maxUses && coupon.usedBy.length >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'Already used this coupon' });

    res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, minOrderValue: coupon.minOrderValue, maxDiscount: coupon.maxDiscount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Coupon created', coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon updated', coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};
