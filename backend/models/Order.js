const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { name: String, value: String },
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    billing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      shippingCharge: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ['cod', 'upi', 'card', 'debit_card', 'credit_card', 'netbanking', 'net_banking', 'stripe'],
        required: true,
      },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      transactionId: { type: String, default: '' },
      paidAt: Date,
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    timeline: [timelineSchema],
    trackingNumber: { type: String, default: '' },
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: { type: String, default: '' },
    notes: { type: String, default: '' },
    isReviewed: { type: Boolean, default: false },
    invoiceUrl: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for totalAmount (alias for billing.total) for frontend compatibility
orderSchema.virtual('totalAmount').get(function () {
  return this.billing?.total || 0;
});

// Virtual for paymentStatus for frontend compatibility
orderSchema.virtual('paymentStatus').get(function () {
  return this.payment?.status || 'pending';
});

// Virtual for paymentMethod for frontend compatibility
orderSchema.virtual('paymentMethod').get(function () {
  return this.payment?.method || '';
});

// Auto-generate order number
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(5, '0')}`;
  }
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
// Note: orderNumber has unique:true which already creates an index

module.exports = mongoose.model('Order', orderSchema);
