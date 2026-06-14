const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadImage, uploadMultipleImages, deleteImage, generateSlug, paginate, paginationResult } = require('../utils/helpers');

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, search, category, brand, minPrice, maxPrice,
      minRating, inStock, sort = '-createdAt', featured, newArrival, bestSeller, status
    } = req.query;

    const query = {};

    // Status filter (admin sees all, public sees active only)
    if (req.user?.role === 'admin' && status) {
      query.status = status;
    } else if (!req.user?.role === 'admin') {
      query.status = 'active';
    } else {
      query.status = { $ne: 'draft' };
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ slug: category }).lean();
      if (cat) query.category = cat._id;
    }

    // Brand filter
    if (brand) {
      query.brand = { $in: brand.split(',').map((b) => new RegExp(b.trim(), 'i')) };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Special flags
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;

    // Sort options
    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      'createdAt': { createdAt: 1 },
      '-price': { price: -1 },
      'price': { price: 1 },
      '-ratings.average': { 'ratings.average': -1 },
      '-totalSold': { totalSold: -1 },
    };
    const sortObj = sortOptions[sort] || { createdAt: -1 };

    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(lim)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      ...paginationResult(total, pageNum, lim),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Track recently viewed
    if (req.user) {
      await require('../models/User').findByIdAndUpdate(req.user._id, {
        $addToSet: { recentlyViewed: product._id },
        $push: { recentlyViewed: { $each: [], $slice: -20 } },
      });
    }

    // Get related products
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(8)
      .select('name slug price discount images ratings stock brand')
      .lean();

    res.json({ success: true, product, related });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body, createdBy: req.user._id };

    // Generate slug
    productData.slug = generateSlug(productData.name);

    // Check slug uniqueness
    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
      productData.slug = `${productData.slug}-${Date.now()}`;
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadMultipleImages(req.files, 'ecommerce/products');
      productData.images = uploadResults.map((r, i) => ({
        url: r.secure_url,
        publicId: r.public_id,
        alt: `${productData.name} - Image ${i + 1}`,
      }));
    }

    // Parse JSON fields if sent as strings
    if (typeof productData.variants === 'string') productData.variants = JSON.parse(productData.variants);
    if (typeof productData.specifications === 'string') productData.specifications = JSON.parse(productData.specifications);
    if (typeof productData.tags === 'string') productData.tags = JSON.parse(productData.tags);

    const product = await Product.create(productData);
    await product.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadMultipleImages(req.files, 'ecommerce/products');
      const newImages = uploadResults.map((r, i) => ({
        url: r.secure_url,
        publicId: r.public_id,
        alt: `${product.name} - Image`,
      }));
      updateData.images = [...(product.images || []), ...newImages];
    }

    // Parse JSON fields
    if (typeof updateData.variants === 'string') updateData.variants = JSON.parse(updateData.variants);
    if (typeof updateData.specifications === 'string') updateData.specifications = JSON.parse(updateData.specifications);
    if (typeof updateData.tags === 'string') updateData.tags = JSON.parse(updateData.tags);

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.filter((img) => img.publicId).map((img) => img.publicId);
      await Promise.allSettled(publicIds.map((id) => deleteImage(id)));
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Search autocomplete
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, products: [] });
    }

    const products = await Product.find({
      $text: { $search: q },
      status: 'active',
    })
      .select('name slug images price discount ratings brand')
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product recommendations
// @route   GET /api/products/recommendations
// @access  Private (optional)
exports.getRecommendations = async (req, res, next) => {
  try {
    let query = { status: 'active' };

    if (req.user) {
      const user = await require('../models/User').findById(req.user._id).populate('recentlyViewed', 'category');
      if (user.recentlyViewed && user.recentlyViewed.length > 0) {
        const categories = [...new Set(user.recentlyViewed.map((p) => p.category?.toString()).filter(Boolean))];
        if (categories.length > 0) {
          query.category = { $in: categories };
        }
      }
    }

    const products = await Product.find(query)
      .select('name slug price discount images ratings brand category stock')
      .populate('category', 'name slug')
      .sort({ 'ratings.average': -1, totalSold: -1 })
      .limit(12)
      .lean();

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get brands list
// @route   GET /api/products/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { status: 'active', brand: { $ne: '' } });
    res.json({ success: true, brands: brands.sort() });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:publicId
// @access  Admin
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const publicId = decodeURIComponent(req.params.publicId);
    await deleteImage(publicId);

    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.json({ success: true, message: 'Image deleted', product });
  } catch (error) {
    next(error);
  }
};
