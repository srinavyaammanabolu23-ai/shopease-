const cloudinary = require('../config/cloudinary');

// Upload single image to Cloudinary
exports.uploadImage = async (fileBuffer, folder = 'ecommerce', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Upload multiple images
exports.uploadMultipleImages = async (files, folder = 'ecommerce') => {
  const uploadPromises = files.map((file) =>
    exports.uploadImage(file.buffer, folder, { public_id: `${Date.now()}-${file.originalname.split('.')[0]}` })
  );
  return Promise.all(uploadPromises);
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
};

// Delete multiple images
exports.deleteMultipleImages = async (publicIds) => {
  const deletePromises = publicIds.map((id) => exports.deleteImage(id));
  return Promise.all(deletePromises);
};

// Generate product slug
exports.generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Pagination helper
exports.paginate = (page = 1, limit = 12) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

// Build pagination response
exports.paginationResult = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
