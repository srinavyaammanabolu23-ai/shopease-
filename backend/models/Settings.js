const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    store: {
      name: { type: String, default: 'ShopEase' },
      tagline: { type: String, default: 'Your One-Stop Shopping Destination' },
      logo: { type: String, default: '' },
      favicon: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
    },
    payment: {
      cod: { enabled: { type: Boolean, default: true } },
      stripe: { enabled: { type: Boolean, default: false }, publicKey: String },
      upi: { enabled: { type: Boolean, default: true }, id: String },
    },
    shipping: {
      freeShippingThreshold: { type: Number, default: 499 },
      defaultShippingCharge: { type: Number, default: 49 },
      estimatedDays: { type: Number, default: 5 },
    },
    tax: {
      gstEnabled: { type: Boolean, default: true },
      gstRate: { type: Number, default: 18 },
    },
    email: {
      host: String,
      port: Number,
      user: String,
      from: String,
    },
    social: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
    },
    features: {
      reviews: { type: Boolean, default: true },
      wishlist: { type: Boolean, default: true },
      comparison: { type: Boolean, default: true },
      chat: { type: Boolean, default: false },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: 'We are under maintenance. Please check back later.' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
