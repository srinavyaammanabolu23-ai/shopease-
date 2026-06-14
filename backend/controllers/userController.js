const User = require('../models/User');
const Order = require('../models/Order');
const { uploadImage, deleteImage, paginate, paginationResult } = require('../utils/helpers');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name slug price discount images ratings stock brand')
      .populate('recentlyViewed', 'name slug price discount images ratings');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    // Handle avatar upload
    if (req.file) {
      if (req.user.avatar) {
        // Try to extract public ID and delete old avatar
        const parts = req.user.avatar.split('/');
        const publicId = parts.slice(-2).join('/').split('.')[0];
        await deleteImage(publicId).catch(() => {});
      }
      const result = await uploadImage(req.file.buffer, 'ecommerce/avatars');
      updateData.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // If this is default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // First address is default
    if (user.addresses.length === 0) req.body.isDefault = true;

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({ success: true, message: 'Address updated', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.id);
    await user.save();
    res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist (add/remove)
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);
    let action;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();
    res.json({ success: true, message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`, action, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist with populated products
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name slug price discount images ratings stock brand isNewArrival isBestSeller');
    const items = (user.wishlist || []).map(p => ({ product: p }));
    res.json({ success: true, items, wishlist: { items } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's order history with stats
// @route   GET /api/users/orders
// @access  Private
exports.getOrderHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const [orders, total, stats] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Order.countDocuments({ user: req.user._id }),
      Order.aggregate([
        { $match: { user: req.user._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalSpent: { $sum: '$billing.total' }, totalOrders: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      ...paginationResult(total, pageNum, lim),
      orders,
      stats: stats[0] || { totalSpent: 0, totalOrders: 0 },
    });
  } catch (error) {
    next(error);
  }
};

// ====== ADMIN ROUTES ======

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (status === 'active') query.isActive = true;
    if (status === 'blocked') query.isActive = false;
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      User.countDocuments(query),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, user, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/Unblock user (Admin)
// @route   PUT /api/users/:id/toggle-status
// @access  Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block admin users' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/users/admin/stats
// @access  Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, newUsersThisMonth, totalAdmins, activeUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user', isActive: true }),
    ]);

    // Monthly growth data
    const monthlyGrowth = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, stats: { totalUsers, newUsersThisMonth, totalAdmins, activeUsers, monthlyGrowth } });
  } catch (error) {
    next(error);
  }
};
