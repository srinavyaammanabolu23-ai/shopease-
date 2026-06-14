import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HiShoppingBag, HiUsers, HiStar, HiTruck, HiShieldCheck,
  HiArrowPath, HiHeartSolid, HiGlobeAlt, HiSparkles,
  HiCheckCircle, HiPhone, HiEnvelope
} from 'react-icons/hi2'

const stats = [
  { value: '10,000+', label: 'Products', icon: HiShoppingBag },
  { value: '5M+', label: 'Happy Customers', icon: HiUsers },
  { value: '4.8★', label: 'Average Rating', icon: HiStar },
  { value: '50+', label: 'Cities Covered', icon: HiGlobeAlt },
]

const team = [
  { name: 'Arjun Sharma', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { name: 'Priya Mehta', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
  { name: 'Rahul Verma', role: 'CTO', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  { name: 'Sneha Patel', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
]

const values = [
  { icon: HiShieldCheck, title: 'Trust & Transparency', desc: 'We believe in honest pricing, authentic products, and clear communication with our customers.' },
  { icon: HiSparkles, title: 'Quality First', desc: 'Every product on ShopEase is carefully vetted to ensure it meets our high quality standards.' },
  { icon: HiUsers, title: 'Customer Obsessed', desc: 'Our customers are at the heart of every decision we make. Your satisfaction is our success.' },
  { icon: HiArrowPath, title: 'Continuous Innovation', desc: 'We constantly improve our platform to bring you the best shopping experience possible.' },
  { icon: HiTruck, title: 'Fast & Reliable', desc: 'We partner with top logistics providers to ensure your orders arrive safely and on time.' },
  { icon: HiGlobeAlt, title: 'Sustainability', desc: 'We are committed to eco-friendly packaging and sustainable business practices.' },
]

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us - ShopEase</title>
        <meta name="description" content="Learn about ShopEase — India's trusted e-commerce destination serving 5 million+ customers." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <HiSparkles className="w-4 h-4" /> Founded in 2020
            </span>
            <h1 className="text-4xl md:text-6xl font-black font-display mb-6 leading-tight">
              Shopping Made <span className="text-accent-300">Simple</span> &<br />Joyful
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-10">
              ShopEase is India's fastest-growing e-commerce platform, connecting millions of customers with the products they love at unbeatable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/products" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
                Shop Now
              </Link>
              <Link to="/contact" className="border-2 border-white/50 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-black font-display text-gray-900 dark:text-white mt-3 mb-6">
                From a Small Idea to India's Favourite Store
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                ShopEase was born in 2020 when our founder Arjun Sharma noticed how difficult it was for people in smaller cities to access quality products at fair prices. Starting from a single room in Mumbai, we set out to bridge this gap.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Today, we serve over 5 million customers across 50+ cities in India, offering 10,000+ products across electronics, fashion, home decor, and more. Every product is carefully curated for quality and value.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Our mission remains the same — make quality products accessible to everyone, delivered with a smile.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg">A</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Arjun Sharma</p>
                  <p className="text-gray-500 text-sm">CEO & Founder, ShopEase</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" alt="ShopEase Team"
                  className="rounded-2xl shadow-2xl w-full object-cover h-96" />
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <HiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Trusted Since 2020</p>
                    <p className="text-gray-500 text-xs">5M+ happy customers</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values cards */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">What Drives Us</h2>
            <p className="section-subtitle">Our core pillars that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: '🎯', title: 'Our Mission', desc: 'To make quality products accessible to every Indian household, regardless of their location, at prices that feel fair and transparent.' },
              { icon: '🔭', title: 'Our Vision', desc: "To become India's most loved and trusted e-commerce platform, where shopping is a delightful experience from discovery to delivery." },
              { icon: '💎', title: 'Our Values', desc: 'Trust, transparency, customer obsession, quality, innovation, and sustainability are the values that shape our culture and decisions.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.15 }} className="card-hover p-8 text-center">
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">Meet the Team</h2>
            <p className="section-subtitle">The passionate people behind ShopEase</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {team.map((member, i) => (
              <motion.div key={member.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }} className="text-center group">
                <div className="relative inline-block mb-4">
                  <img src={member.img} alt={member.name}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-lg group-hover:shadow-xl transition-shadow" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-primary-600 dark:text-primary-400 text-sm font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">Why Choose ShopEase?</h2>
            <p className="section-subtitle">Everything you need for a great shopping experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {values.map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }} className="flex gap-4 p-6 card-hover">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{v.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-black font-display mb-4">Ready to Start Shopping?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">Join 5 million+ happy customers and discover amazing products every day.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
              Explore Products
            </Link>
            <Link to="/contact" className="border-2 border-white/50 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
