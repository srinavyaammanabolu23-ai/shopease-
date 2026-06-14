import { Link } from 'react-router-dom'
import {
  HiShoppingBag, HiEnvelope, HiPhone, HiMapPin,
  HiArrowRight
} from 'react-icons/hi2'
import {
  FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaGooglePay, FaPaypal, FaCreditCard
} from 'react-icons/fa'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Footer = () => {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('🎉 Thanks for subscribing! Check your email for a welcome offer.')
    setEmail('')
  }

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
  ]

  const legalLinks = [
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Return Policy', to: '/returns' },
  ]

  const categories = [
    { label: 'Electronics', to: '/products?category=electronics' },
    { label: 'Fashion', to: '/products?category=fashion' },
    { label: 'Home & Living', to: '/products?category=home-living' },
    { label: 'Sports', to: '/products?category=sports' },
    { label: 'Books', to: '/products?category=books' },
    { label: 'Beauty', to: '/products?category=beauty' },
  ]

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 mt-auto">
      {/* Newsletter bar */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold font-display">Stay in the Loop!</h3>
              <p className="text-white/80 text-sm mt-1">Subscribe for exclusive deals, new arrivals & more.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                required
              />
              <button type="submit" className="btn bg-white text-primary-700 hover:bg-gray-100 font-semibold whitespace-nowrap">
                Subscribe <HiArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <HiShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-white">ShopEase</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Your one-stop shopping destination for electronics, fashion, home essentials, and more.
              Quality products at unbeatable prices.
            </p>
            {/* Contact info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <HiMapPin className="w-4 h-4 text-primary-400 shrink-0" />
                <span>123 Commerce Street, Mumbai, MH 400001</span>
              </div>
              <div className="flex items-center gap-2">
                <HiPhone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
              </div>
              <div className="flex items-center gap-2">
                <HiEnvelope className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:support@shopease.com" className="hover:text-white transition-colors">support@shopease.com</a>
              </div>
            </div>
            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: FaFacebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
                { icon: FaTwitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400' },
                { icon: FaInstagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
                { icon: FaYoutube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
              ].map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center transition-all duration-200 ${color} hover:bg-gray-700`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.to}>
                  <Link to={cat.to} className="text-sm hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Customer</h4>
              <ul className="space-y-2">
                <li><Link to="/profile" className="text-sm hover:text-white transition-colors">My Account</Link></li>
                <li><Link to="/orders" className="text-sm hover:text-white transition-colors">Track Order</Link></li>
                <li><Link to="/wishlist" className="text-sm hover:text-white transition-colors">Wishlist</Link></li>
                <li><Link to="/contact" className="text-sm hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-center md:text-left">
              © 2024 ShopEase. All rights reserved. Made with ❤️ in India.
            </p>
            {/* Payment methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs mr-1">We accept:</span>
              <div className="flex gap-2 text-gray-400">
                <FaCreditCard className="w-5 h-5 text-blue-400" title="Credit/Debit Card" />
                <FaGooglePay className="w-5 h-5 text-white" title="Google Pay" />
                <FaPaypal className="w-5 h-5 text-blue-500" title="PayPal" />
              </div>
              <span className="text-xs ml-1 text-gray-500">+ COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
