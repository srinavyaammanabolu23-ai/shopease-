const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size"
  value: { type: String, required: true }, // e.g., "Red", "XL"
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  image: { type: String, default: '' },
});

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage
    images: [{ url: String, publicId: String, alt: String }],
    variants: [variantSchema],
    specifications: [specificationSchema],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, default: '' },
    weight: { type: Number, default: 0 }, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    tags: [String],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
    lowStockThreshold: { type: Number, default: 5 },
    totalSold: { type: Number, default: 0 },
    meta: {
      title: String,
      description: String,
      keywords: String,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for effective price after discount
productSchema.virtual('effectivePrice').get(function () {
  return this.price - (this.price * this.discount) / 100;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1, 'ratings.average': -1 });
// Note: slug has unique:true which already creates an index

module.exports = mongoose.model('Product', productSchema);
