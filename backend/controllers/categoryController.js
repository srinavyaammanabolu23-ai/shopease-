const Category = require('../models/Category');
const { uploadImage, deleteImage, generateSlug } = require('../utils/helpers');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const { includeInactive, parent, flat } = req.query;

    const query = {};
    if (!includeInactive || req.user?.role !== 'admin') query.isActive = true;
    if (parent === 'none') query.parent = null;
    else if (parent) query.parent = parent;

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .populate('productCount')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Build tree structure if not flat
    if (!flat) {
      const roots = categories.filter((c) => !c.parent);
      const addChildren = (cat) => ({
        ...cat,
        children: categories.filter((c) => c.parent?.toString() === cat._id.toString()).map(addChildren),
      });
      return res.json({ success: true, categories: roots.map(addChildren) });
    }

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parent', 'name slug')
      .populate('subcategories')
      .populate('productCount');

    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parent, icon, sortOrder, meta } = req.body;

    const slug = generateSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ success: false, message: 'Category with this name already exists' });

    const categoryData = { name, slug, description, parent: parent || null, icon, sortOrder, meta };

    if (req.file) {
      const result = await uploadImage(req.file.buffer, 'ecommerce/categories');
      categoryData.image = result.secure_url;
      categoryData.imagePublicId = result.public_id;
    }

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const updateData = { ...req.body };

    if (req.file) {
      if (category.imagePublicId) await deleteImage(category.imagePublicId);
      const result = await uploadImage(req.file.buffer, 'ecommerce/categories');
      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check for products in this category
    const productCount = await require('../models/Product').countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete category with ${productCount} products. Move products first.` });
    }

    if (category.imagePublicId) await deleteImage(category.imagePublicId);
    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
