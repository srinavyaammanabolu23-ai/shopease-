const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { sendOrderConfirmationEmail } = require('../utils/email');
const { paginate, paginationResult } = require('../utils/helpers');

const TAX_RATE = 0.18; // 18% GST

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Sanitize shipping address — strip Mongoose _id if it came from saved address
    const cleanAddress = {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
    };

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price discount stock images status')
      .populate('coupon');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate stock and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== 'active') {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}". Only ${product.stock} available.` });
      }

      const price = product.price - (product.price * product.discount) / 100;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price,
        quantity: item.quantity,
        variant: item.variant || {},
      });
    }

    // Calculate billing
    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const tax = Math.round(subtotal * TAX_RATE);
    const couponDiscount = cart.couponDiscount || 0;
    const total = Math.max(0, subtotal + tax + shippingCharge - couponDiscount);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: cleanAddress,
      billing: { subtotal, tax, shippingCharge, couponDiscount, total },
      payment: { method: paymentMethod, status: 'pending' },
      coupon: cart.coupon?._id || null,
      status: 'pending',
      timeline: [{ status: 'pending', note: 'Order placed successfully' }],
      notes: notes || '',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    // Update stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, totalSold: item.quantity },
      });
    }

    // Mark coupon as used
    if (cart.coupon) {
      await Coupon.findByIdAndUpdate(cart.coupon._id, {
        $push: { usedBy: req.user._id },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponDiscount: 0 });

    // Create notification for admin
    try {
      await Notification.create({
        type: 'order',
        title: 'New Order Received',
        message: `New order #${order.orderNumber} for ₹${total.toFixed(2)} from ${req.user.name}`,
        link: `/admin/orders/${order._id}`,
        metadata: { orderId: order._id, amount: total },
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr.message);
    }

    // Send confirmation email (non-blocking)
    try {
      await sendOrderConfirmationEmail(req.user.email, req.user.name, order);
    } catch (emailErr) {
      console.error('Order email failed:', emailErr.message);
    }

    await order.populate('items.product', 'name images slug');

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = { user: req.user._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean({ virtuals: true }),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images slug')
      .populate('coupon', 'code type value');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Users can only see their own orders
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.status}` });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSold: -item.quantity },
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.timeline.push({ status: 'cancelled', note: reason, updatedBy: req.user._id });
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
};

// ====== ADMIN ROUTES ======

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = {};
    if (status) query.status = status;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note = '', trackingNumber } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['packed', 'cancelled'],
      packed: ['shipped'],
      shipped: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${order.status}" to "${status}"`,
      });
    }

    order.status = status;
    order.timeline.push({ status, note, updatedBy: req.user._id });
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    await order.save();

    // Notify user
    await Notification.create({
      user: order.user._id,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} is now ${status.replace('_', ' ').toUpperCase()}`,
      link: `/orders/${order._id}/track`,
      metadata: { orderId: order._id, status },
    });

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order analytics (Admin)
// @route   GET /api/orders/analytics
// @access  Admin
exports.getOrderAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, totalRevenue, monthlyOrders, monthlyRevenue,
      lastMonthOrders, lastMonthRevenue, statusBreakdown, dailySales
    ] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$billing.total' } } }]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$billing.total' } } }]),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } }),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$billing.total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$billing.total' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        lastMonthOrders,
        lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
        statusBreakdown,
        dailySales,
      },
    });
  } catch (error) {
    next(error);
  }
};
