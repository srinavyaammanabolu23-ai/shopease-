require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Order = require('./models/Order');
const Settings = require('./models/Settings');

const connectDB = require('./config/db');

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronics', icon: '💻', sortOrder: 1 },
  { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing and accessories', icon: '👗', sortOrder: 2 },
  { name: 'Home & Living', slug: 'home-living', description: 'Furniture and home decor', icon: '🏠', sortOrder: 3 },
  { name: 'Sports', slug: 'sports', description: 'Sports and outdoor equipment', icon: '⚽', sortOrder: 4 },
  { name: 'Books', slug: 'books', description: 'Books and stationery', icon: '📚', sortOrder: 5 },
  { name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care', icon: '💄', sortOrder: 6 },
  { name: 'Toys & Games', slug: 'toys-games', description: 'Toys and games for all ages', icon: '🎮', sortOrder: 7 },
  { name: 'Grocery', slug: 'grocery', description: 'Fresh groceries and food', icon: '🛒', sortOrder: 8 },
];

const generateProducts = (categoryMap) => [
  {
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256gb',
    description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and ProRes video. Features a 48MP main camera system.',
    shortDescription: 'A17 Pro chip, Titanium design, 48MP camera',
    category: categoryMap['electronics'],
    brand: 'Apple',
    price: 159900,
    discount: 5,
    stock: 50,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', alt: 'iPhone 15 Pro Max' }
    ],
    specifications: [
      { key: 'Chip', value: 'A17 Pro' },
      { key: 'Display', value: '6.7" Super Retina XDR' },
      { key: 'Camera', value: '48MP + 12MP + 12MP' },
      { key: 'Battery', value: '4422 mAh' },
      { key: 'Storage', value: '256GB' },
      { key: 'RAM', value: '8GB' },
    ],
    tags: ['iphone', 'apple', 'smartphone', 'pro'],
    ratings: { average: 4.8, count: 234 },
    status: 'active',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, and 5000mAh battery.',
    shortDescription: 'Snapdragon 8 Gen 3, 200MP camera, S Pen',
    category: categoryMap['electronics'],
    brand: 'Samsung',
    price: 134999,
    discount: 8,
    stock: 35,
    isFeatured: true,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1706344348535-87fb2e55f765?w=600', alt: 'Samsung S24 Ultra' }
    ],
    specifications: [
      { key: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { key: 'Display', value: '6.8" QHD+ AMOLED' },
      { key: 'Camera', value: '200MP + 12MP + 10MP + 50MP' },
      { key: 'Battery', value: '5000 mAh' },
      { key: 'Storage', value: '256GB' },
      { key: 'RAM', value: '12GB' },
    ],
    tags: ['samsung', 'galaxy', 'android', 'smartphone'],
    ratings: { average: 4.7, count: 189 },
    status: 'active',
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    description: 'Industry-leading noise cancellation with 30-hour battery life, Multipoint connection, and speak-to-chat technology.',
    shortDescription: 'Best-in-class noise cancellation, 30hr battery',
    category: categoryMap['electronics'],
    brand: 'Sony',
    price: 29990,
    discount: 15,
    stock: 80,
    isFeatured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600', alt: 'Sony WH-1000XM5' }
    ],
    specifications: [
      { key: 'Type', value: 'Over-ear' },
      { key: 'Battery', value: '30 hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.2' },
      { key: 'Weight', value: '250g' },
    ],
    tags: ['headphones', 'sony', 'noise-cancelling', 'wireless'],
    ratings: { average: 4.9, count: 567 },
    status: 'active',
  },
  {
    name: 'MacBook Air M3 13"',
    slug: 'macbook-air-m3-13inch',
    description: 'Supercharged by M3 chip. Up to 18 hours battery life, 8GB unified memory, stunning Liquid Retina display.',
    shortDescription: 'M3 chip, 18hr battery, 8GB RAM, 256GB SSD',
    category: categoryMap['electronics'],
    brand: 'Apple',
    price: 114900,
    discount: 3,
    stock: 25,
    isFeatured: true,
    isNewArrival: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', alt: 'MacBook Air M3' }
    ],
    specifications: [
      { key: 'Chip', value: 'Apple M3' },
      { key: 'Display', value: '13.6" Liquid Retina' },
      { key: 'RAM', value: '8GB Unified Memory' },
      { key: 'Storage', value: '256GB SSD' },
      { key: 'Battery', value: '18 hours' },
    ],
    tags: ['macbook', 'apple', 'laptop', 'm3'],
    ratings: { average: 4.9, count: 312 },
    status: 'active',
  },
  {
    name: 'Nike Air Max 270 Running Shoes',
    slug: 'nike-air-max-270-running-shoes',
    description: "Nike's largest Air unit yet delivers an incredibly soft ride that feels as roomy as it looks.",
    shortDescription: 'Largest Air unit, ultra-comfortable, stylish',
    category: categoryMap['sports'],
    brand: 'Nike',
    price: 12995,
    discount: 20,
    stock: 120,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Nike Air Max 270' }
    ],
    specifications: [
      { key: 'Type', value: 'Running' },
      { key: 'Material', value: 'Mesh + Rubber' },
      { key: 'Sole', value: 'Air Max Cushion' },
    ],
    tags: ['nike', 'shoes', 'running', 'sports'],
    ratings: { average: 4.6, count: 1234 },
    status: 'active',
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    slug: 'levis-501-original-jeans',
    description: 'The original, iconic straight-fit jeans. Made with Levi\'s signature denim for lasting comfort and style.',
    shortDescription: 'Original straight-fit, premium denim, iconic style',
    category: categoryMap['fashion'],
    brand: "Levi's",
    price: 5999,
    discount: 25,
    stock: 200,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', alt: "Levi's 501 Jeans" }
    ],
    specifications: [
      { key: 'Fit', value: 'Straight' },
      { key: 'Material', value: '100% Cotton Denim' },
      { key: 'Rise', value: 'Mid-rise' },
    ],
    tags: ['levis', 'jeans', 'denim', 'fashion'],
    ratings: { average: 4.5, count: 892 },
    status: 'active',
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    slug: 'instant-pot-duo-7in1',
    description: '7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.',
    shortDescription: '7-in-1 programmable multi-cooker, 6 quart',
    category: categoryMap['home-living'],
    brand: 'Instant Pot',
    price: 8999,
    discount: 30,
    stock: 60,
    isFeatured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', alt: 'Instant Pot' }
    ],
    specifications: [
      { key: 'Capacity', value: '6 Quart' },
      { key: 'Functions', value: '7-in-1' },
      { key: 'Material', value: 'Stainless Steel' },
      { key: 'Power', value: '1000W' },
    ],
    tags: ['kitchen', 'cooker', 'instant-pot', 'appliance'],
    ratings: { average: 4.7, count: 2345 },
    status: 'active',
  },
  {
    name: 'The Psychology of Money - Morgan Housel',
    slug: 'psychology-of-money-morgan-housel',
    description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money.',
    shortDescription: 'Timeless lessons on wealth and happiness',
    category: categoryMap['books'],
    brand: 'Harriman House',
    price: 499,
    discount: 35,
    stock: 500,
    isNewArrival: false,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', alt: 'Psychology of Money Book' }
    ],
    specifications: [
      { key: 'Author', value: 'Morgan Housel' },
      { key: 'Pages', value: '256' },
      { key: 'Publisher', value: 'Harriman House' },
      { key: 'Language', value: 'English' },
    ],
    tags: ['book', 'finance', 'money', 'psychology'],
    ratings: { average: 4.8, count: 5678 },
    status: 'active',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shopease.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      isActive: true,
      phone: '9999999999',
    });
    console.log('✅ Admin created: admin@shopease.com / Admin@123');

    // Create demo customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'User@123',
      role: 'user',
      isVerified: true,
      isActive: true,
      phone: '9876543210',
      addresses: [{
        type: 'home',
        fullName: 'John Doe',
        phone: '9876543210',
        street: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
      }],
    });
    console.log('✅ Customer created: john@example.com / User@123');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });
    console.log(`✅ ${createdCategories.length} categories created`);

    // Create products
    const productsData = generateProducts(categoryMap);
    const createdProducts = await Product.insertMany(
      productsData.map((p) => ({ ...p, createdBy: admin._id }))
    );
    console.log(`✅ ${createdProducts.length} products created`);

    // Create coupons
    const coupons = await Coupon.insertMany([
      {
        code: 'WELCOME10',
        description: 'Welcome discount for new users',
        type: 'percentage',
        value: 10,
        minOrderValue: 500,
        maxDiscount: 500,
        maxUses: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        code: 'FLAT200',
        description: 'Flat ₹200 off on orders above ₹1000',
        type: 'fixed',
        value: 200,
        minOrderValue: 1000,
        maxUses: 500,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        code: 'SUMMER25',
        description: 'Summer sale 25% off (max ₹1000)',
        type: 'percentage',
        value: 25,
        minOrderValue: 2000,
        maxDiscount: 1000,
        maxUses: 200,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
    ]);
    console.log(`✅ ${coupons.length} coupons created`);

    // Create default settings
    await Settings.create({
      key: 'main',
      store: {
        name: 'ShopEase',
        tagline: 'Your One-Stop Shopping Destination',
        email: 'support@shopease.com',
        phone: '+91 98765 43210',
        address: '123 Commerce Street, Mumbai, Maharashtra 400001',
        currency: 'INR',
        currencySymbol: '₹',
      },
    });
    console.log('✅ Store settings created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Admin Login: admin@shopease.com');
    console.log('🔑 Admin Password: Admin@123');
    console.log('📧 Customer Login: john@example.com');
    console.log('🔑 Customer Password: User@123');
    console.log('\n💳 Coupons: WELCOME10, FLAT200, SUMMER25\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
