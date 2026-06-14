const stripe = require('stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { sendOrderConfirmationEmail } = require('../utils/email');

// Initialize Stripe if key is present and not default placeholder
const getStripeInstance = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'your_stripe_secret_key') {
    return null;
  }
  return stripe(key);
};

// @desc    Create Stripe Checkout Session (or Mock Session)
// @route   POST /api/payments/create-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { shippingAddress, notes } = req.body;

    // 1. Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price discount stock images status')
      .populate('coupon');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 2. Validate stock and build order items
    const orderItems = [];
    let subtotal = 0;
    const TAX_RATE = 0.18;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== 'active') {
        return res.status(400).json({ success: false, message: `Product "${item.product?.name || 'Product'}" is no longer available` });
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

    // 3. Create the order in "pending" payment status
    const cleanAddress = {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
    };

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: cleanAddress,
      billing: { subtotal, tax, shippingCharge, couponDiscount, total },
      payment: { method: 'card', status: 'pending' },
      coupon: cart.coupon?._id || null,
      status: 'pending',
      timeline: [{ status: 'pending', note: 'Order placed, awaiting payment confirmation' }],
      notes: notes || '',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    // 4. Update stock for each product
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

    // Clear cart immediately since order is created
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponDiscount: 0 });

    // 5. Try using Stripe Checkout
    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
      // Return a simulated mock checkout redirect URL
      const mockSessionId = `mock_session_${Date.now()}_${order._id}`;
      return res.status(200).json({
        success: true,
        url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id=${mockSessionId}`,
        isMock: true,
        orderId: order._id,
      });
    }

    // Build real Stripe line items
    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects paisa
      },
      quantity: item.quantity,
    }));

    // Add tax and shipping as line items in Stripe if any
    if (shippingCharge > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Delivery Charge' },
          unit_amount: shippingCharge * 100,
        },
        quantity: 1,
      });
    }
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'GST (Tax)' },
          unit_amount: tax * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    res.status(200).json({ success: true, url: session.url, isMock: false });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Stripe Payment or Mock Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    let orderId;
    let transactionId = sessionId;
    let isMock = sessionId.startsWith('mock_session_');

    if (isMock) {
      // Format: mock_session_timestamp_orderId
      const parts = sessionId.split('_');
      orderId = parts[parts.length - 1];
    } else {
      const stripeInstance = getStripeInstance();
      if (!stripeInstance) {
        return res.status(400).json({ success: false, message: 'Stripe keys missing. Cannot verify real session.' });
      }
      const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
      orderId = session.metadata.orderId;
      transactionId = session.payment_intent || sessionId;
    }

    const order = await Order.findById(orderId).populate('items.product', 'name images');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.payment.status === 'paid') {
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    // Update payment details
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.transactionId = transactionId;
    order.status = 'confirmed';
    order.timeline.push({ status: 'confirmed', note: 'Payment verified successfully' });

    await order.save();

    // Create notification for admin
    try {
      await Notification.create({
        type: 'order',
        title: 'Payment Confirmed',
        message: `Payment confirmed for order #${order.orderNumber} (₹${order.billing.total})`,
        link: `/admin/orders/${order._id}`,
        metadata: { orderId: order._id, amount: order.billing.total },
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr.message);
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, req.user.name, order);
    } catch (emailErr) {
      console.error('Order email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'Payment verified successfully!', order });
  } catch (error) {
    next(error);
  }
};
