import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  HiArrowRight, HiShoppingBag, HiTruck, HiShieldCheck,
  HiStar, HiPhone, HiArrowLongRight, HiCheckCircle, HiSparkles
} from 'react-icons/hi2'
import { useGetProductsQuery, useGetCategoriesQuery } from '../../services/api'
import ProductCard from '../../components/ui/ProductCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import toast from 'react-hot-toast'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const HomePage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const { data: featuredData, isLoading: featuredLoading } = useGetProductsQuery({ isFeatured: true, limit: 8, status: 'active' })
  const { data: newArrivalsData, isLoading: newLoading } = useGetProductsQuery({ isNewArrival: true, limit: 8, status: 'active' })
  const { data: bestSellersData, isLoading: bestLoading } = useGetProductsQuery({ isBestSeller: true, limit: 8, status: 'active' })
  const { data: categoriesData } = useGetCategoriesQuery({ flat: true })

  const featuredProducts = featuredData?.products || []
  const newArrivals = newArrivalsData?.products || []
  const bestSellers = bestSellersData?.products || []
  const categories = categoriesData?.categories?.filter(c => !c.parent)?.slice(0, 8) || []

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('🎉 Subscribed! Welcome offer sent to your email.')
    setEmail('')
  }

  const testimonials = [
    { name: 'Priya Sharma', location: 'Mumbai', rating: 5, comment: 'Absolutely love ShopEase! The delivery was super fast and the products are exactly as described. Will definitely shop again!', avatar: 'https://i.pravatar.cc/80?img=1' },
    { name: 'Rahul Gupta', location: 'Delhi', rating: 5, comment: 'Best e-commerce experience in India. Great prices, genuine products, and excellent customer support. 10/10 recommend!', avatar: 'https://i.pravatar.cc/80?img=3' },
    { name: 'Anjali Patel', location: 'Bangalore', rating: 5, comment: 'I was skeptical at first but ShopEase exceeded my expectations. Smooth checkout, beautiful packaging, fast delivery!', avatar: 'https://i.pravatar.cc/80?img=5' },
  ]

  const features = [
    { icon: HiTruck, title: 'Free Delivery', desc: 'On orders above ₹499', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: HiArrowLongRight, title: 'Easy Returns', desc: '30-day hassle-free returns', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: HiShieldCheck, title: 'Secure Payment', desc: '100% secure transactions', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: HiPhone, title: '24/7 Support', desc: 'Round the clock assistance', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  const EmptyProducts = ({ section }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <HiSparkles className="w-9 h-9 text-primary-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{section} will appear here once products are added.</p>
      <Link to="/products" className="btn-secondary btn-sm mt-4">Browse All Products</Link>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>ShopEase - Your One-Stop Shopping Destination</title>
        <meta name="description" content="Shop millions of products across electronics, fashion, home & more at unbeatable prices. Free delivery on orders above ₹499." />
      </Helmet>

      {/* ======== HERO SECTION ======== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-gray-900 min-h-[560px] flex items-center">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="container-custom relative z-10 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="text-white"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
                🎉 <span>Mega Sale - Up to 70% Off!</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-tight mb-5">
                Discover
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-accent-400">
                  Amazing Products
                </span>
                at Best Prices
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-white/80 mb-8 max-w-lg">
                Shop from millions of products across electronics, fashion, home essentials and more. Free delivery on orders above ₹499.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link to="/products" className="btn bg-accent-500 text-white hover:bg-accent-600 btn-lg shadow-lg hover:shadow-xl">
                  Shop Now <HiArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/products?featured=true" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 btn-lg backdrop-blur-sm">
                  View Deals
                </Link>
              </motion.div>

              {/* Quick stats */}
              <motion.div variants={fadeUp} className="flex gap-6 mt-10 pt-8 border-t border-white/20">
                {[
                  { value: '10K+', label: 'Products' },
                  { value: '5M+', label: 'Customers' },
                  { value: '4.8★', label: 'Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Product showcase */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative w-80 h-80">
                {/* Main product card */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
                    alt="Featured product"
                    className="w-64 h-64 object-contain drop-shadow-2xl"
                  />
                </div>
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-accent-500 text-white rounded-2xl px-4 py-2 shadow-lg text-sm font-bold"
                >
                  Up to 70% Off!
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2 shadow-lg"
                >
                  <p className="text-xs text-gray-500">Free Delivery</p>
                  <p className="text-sm font-bold text-gray-900">On ₹499+</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES BAR ======== */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CATEGORY SHOWCASE ======== */}
      <section className="py-14 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.length > 0 ? categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl flex items-center justify-center text-2xl">
                    {cat.icon || '📦'}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            )) : (
              // Default categories if API not loaded
              [
                { name: 'Electronics', icon: '💻', slug: 'electronics' },
                { name: 'Fashion', icon: '👗', slug: 'fashion' },
                { name: 'Home', icon: '🏠', slug: 'home-living' },
                { name: 'Sports', icon: '⚽', slug: 'sports' },
                { name: 'Books', icon: '📚', slug: 'books' },
                { name: 'Beauty', icon: '💄', slug: 'beauty' },
                { name: 'Toys', icon: '🎮', slug: 'toys-games' },
                { name: 'Grocery', icon: '🛒', slug: 'grocery' },
              ].map((cat, i) => (
                <motion.div key={cat.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05 }}>
                  <Link to={`/products?category=${cat.slug}`} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl flex items-center justify-center text-2xl">{cat.icon}</div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{cat.name}</span>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ======== FEATURED PRODUCTS ======== */}
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-left">⭐ Featured Products</h2>
              <p className="section-subtitle text-left">Handpicked just for you</p>
            </div>
            <Link to="/products?featured=true" className="btn-secondary btn-sm gap-1">
              View All <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredLoading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.length > 0
                ? featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)
                : <EmptyProducts section="Featured products" />
            }
          </div>
        </div>
      </section>

      {/* ======== PROMO BANNERS ======== */}
      <section className="py-8 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 p-8 min-h-[160px] flex flex-col justify-between cursor-pointer"
              onClick={() => navigate('/products?category=electronics')}
            >
              <div>
                <p className="text-primary-200 text-sm font-medium mb-1">Limited Time</p>
                <h3 className="text-white text-2xl font-black font-display">Up to 50% Off</h3>
                <p className="text-primary-200 mt-1">Electronics & Gadgets</p>
              </div>
              <Link to="/products?category=electronics" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-4 py-2 rounded-lg w-fit hover:bg-primary-50 transition-colors">
                Shop Now <HiArrowRight className="w-4 h-4" />
              </Link>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-20">💻</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-700 p-8 min-h-[160px] flex flex-col justify-between cursor-pointer"
              onClick={() => navigate('/products?newArrival=true&category=fashion')}
            >
              <div>
                <p className="text-pink-200 text-sm font-medium mb-1">New Season</p>
                <h3 className="text-white text-2xl font-black font-display">New Arrivals</h3>
                <p className="text-pink-200 mt-1">Fashion & Accessories</p>
              </div>
              <Link to="/products?category=fashion&newArrival=true" className="inline-flex items-center gap-2 bg-white text-pink-700 font-semibold text-sm px-4 py-2 rounded-lg w-fit hover:bg-pink-50 transition-colors">
                Explore <HiArrowRight className="w-4 h-4" />
              </Link>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-20">👗</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======== NEW ARRIVALS ======== */}
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-left">🆕 New Arrivals</h2>
              <p className="section-subtitle text-left">Fresh off the shelf</p>
            </div>
            <Link to="/products?newArrival=true" className="btn-secondary btn-sm gap-1">
              View All <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newLoading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.length > 0
                ? newArrivals.map((p) => <ProductCard key={p._id} product={p} />)
                : <EmptyProducts section="New arrivals" />
            }
          </div>
        </div>
      </section>

      {/* ======== BEST SELLERS ======== */}
      <section className="py-14 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-left">🔥 Best Sellers</h2>
              <p className="section-subtitle text-left">Most loved by our customers</p>
            </div>
            <Link to="/products?bestSeller=true" className="btn-secondary btn-sm gap-1">
              View All <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestLoading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : bestSellers.length > 0
                ? bestSellers.map((p) => <ProductCard key={p._id} product={p} />)
                : <EmptyProducts section="Best sellers" />
            }
          </div>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Trusted by millions of shoppers across India</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="card p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <HiStar key={i} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                  <HiCheckCircle className="w-5 h-5 text-green-500 ml-auto" title="Verified Customer" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ======== NEWSLETTER ======== */}
      <section className="py-14 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-black font-display mb-3">Don't Miss Out!</h2>
            <p className="text-white/80 mb-6">Subscribe to our newsletter for exclusive deals, new arrivals, and special offers delivered to your inbox.</p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={handleSubscribe}
                className="btn bg-white text-primary-700 hover:bg-gray-100 font-bold px-6 py-3 whitespace-nowrap"
              >
                Subscribe Free
              </button>
            </div>
            <div className="flex justify-center gap-6 mt-6 text-sm text-white/70">
              <span className="flex items-center gap-1"><HiCheckCircle className="w-4 h-4 text-green-300" /> No spam ever</span>
              <span className="flex items-center gap-1"><HiCheckCircle className="w-4 h-4 text-green-300" /> Unsubscribe anytime</span>
              <span className="flex items-center gap-1"><HiCheckCircle className="w-4 h-4 text-green-300" /> Exclusive deals</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
