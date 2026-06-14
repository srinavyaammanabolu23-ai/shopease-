const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug price discount images stock stockStatus brand status',
        populate: { path: 'category', select: 'name' },
      })
      .populate('coupon', 'code type value minOrderValue maxDiscount');

    if (!cart) {
      // Create empty cart so virtuals work
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
    }

    // Calculate price (with discount)
    const price = product.price - (product.price * product.discount) / 100;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant || {})
    );

    if (existingIndex > -1) {
      // Update quantity
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} available.` });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity), variant: variant || {}, price });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug price discount images stock brand status',
    });

    res.json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      const product = await Product.findById(item.product);
      if (product && quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
      }
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug price discount images stock brand status',
    });
    res.json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponDiscount: 0 });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.maxUses && coupon.usedBy.length >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'price discount');
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    cart.coupon = coupon._id;
    cart.couponDiscount = Math.round(discount);
    await cart.save();

    res.json({
      success: true,
      message: `Coupon applied! You saved ₹${cart.couponDiscount}`,
      couponDiscount: cart.couponDiscount,
      coupon: { code: coupon.code, type: coupon.type, value: coupon.value },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { coupon: null, couponDiscount: 0 });
    res.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    next(error);
  }
};
