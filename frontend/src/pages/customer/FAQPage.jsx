import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiMagnifyingGlass, HiChevronDown, HiChatBubbleLeftRight, HiPhone } from 'react-icons/hi2'

const faqData = {
  General: [
    { q: 'What is ShopEase?', a: 'ShopEase is India\'s trusted online shopping platform offering 10,000+ products across electronics, fashion, home & living, sports, books, and more. We serve 5 million+ customers across 50+ cities.' },
    { q: 'Is ShopEase safe to shop from?', a: 'Absolutely! We use industry-standard SSL encryption for all transactions. All products are verified for authenticity, and we have a strict seller verification process.' },
    { q: 'Do I need an account to shop?', a: 'You can browse products without an account, but you\'ll need to create a free account to place orders, track shipments, manage returns, and save your wishlist.' },
    { q: 'How do I create an account?', a: 'Click the "Sign Up" button on the top right, enter your name, email, and password. Verify your email via OTP and you\'re all set!' },
    { q: 'Can I shop from outside India?', a: 'Currently, ShopEase delivers within India only. We are working on expanding our services to other countries soon.' },
  ],
  Orders: [
    { q: 'How do I place an order?', a: 'Browse products, add items to your cart, proceed to checkout, enter your delivery address, choose a payment method, and confirm your order. You\'ll receive a confirmation email immediately.' },
    { q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement if they haven\'t been processed yet. Go to My Orders and click "Cancel Order" or contact our support team.' },
    { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track it in My Orders section or using the Order Tracking page.' },
    { q: 'What if I receive a wrong item?', a: 'We apologize! Please report the issue within 48 hours of delivery through My Orders or contact support. We\'ll arrange an immediate replacement or refund.' },
    { q: 'Can I order multiple items in one order?', a: 'Yes! Add as many items as you like to your cart. Note that items from different sellers may arrive in separate packages.' },
  ],
  Shipping: [
    { q: 'What are the delivery charges?', a: 'Delivery is FREE on orders above ₹499. For orders below ₹499, a flat delivery fee of ₹49 applies. Express delivery is available for select locations.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3–7 business days depending on your location. Metro cities usually receive orders in 2–3 days. Express delivery (1–2 days) is available for select areas.' },
    { q: 'Do you deliver to all parts of India?', a: 'We deliver to 500+ cities across India. Enter your PIN code on the product page to check delivery availability and estimated time for your area.' },
    { q: 'What happens if I miss my delivery?', a: 'Our delivery partner will attempt delivery up to 3 times. If all attempts fail, the package is returned to our warehouse and a full refund is issued.' },
    { q: 'Can I change my delivery address after ordering?', a: 'Address changes are possible within 1 hour of placing the order, before it is processed. Contact our support team immediately for assistance.' },
  ],
  Returns: [
    { q: 'What is the return policy?', a: 'We offer a hassle-free 30-day return policy for most products. Items must be unused, in original packaging, and with all tags intact. Some categories like innerwear and perishables are non-returnable.' },
    { q: 'How do I initiate a return?', a: 'Go to My Orders, select the item you want to return, click "Return Item", choose a reason, and schedule a pickup. Our partner will collect the item from your doorstep.' },
    { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item. The amount is credited back to your original payment method.' },
    { q: 'Can I exchange a product instead of returning?', a: 'Yes! We offer direct exchanges for size/color issues on eligible products. Select "Exchange" instead of "Return" in My Orders. Subject to stock availability.' },
    { q: 'Who bears the return shipping cost?', a: 'If the return is due to our error (wrong/damaged item), we bear the shipping cost. For other returns, a ₹50 reverse shipping charge may apply.' },
  ],
  Payments: [
    { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, BHIM), credit/debit cards (Visa, Mastercard, Amex, RuPay), net banking, EMI, Cash on Delivery, and ShopEase wallet.' },
    { q: 'Is it safe to save my card details?', a: 'Yes, we use PCI-DSS compliant payment processing. Your card details are encrypted and stored securely. We never store your CVV.' },
    { q: 'Can I pay in installments (EMI)?', a: 'EMI is available on purchases above ₹3,000 with select banks for 3, 6, 9, and 12 months. EMI options are shown during checkout.' },
    { q: 'What is Cash on Delivery?', a: 'Cash on Delivery (COD) lets you pay when your order is delivered. COD is available for orders up to ₹10,000. A small COD fee of ₹30 may apply.' },
    { q: 'I was charged but my order failed. What now?', a: 'Failed transaction refunds are automatically processed within 5–7 business days. If you don\'t receive it, contact your bank or our support with the transaction ID.' },
  ],
  Account: [
    { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send an OTP to reset your password. The OTP is valid for 10 minutes.' },
    { q: 'Can I change my email address?', a: 'Yes, go to My Profile > Account Settings to update your email. You\'ll need to verify the new email via OTP before the change takes effect.' },
    { q: 'How do I delete my account?', a: 'To delete your account, go to My Profile > Account Settings > Delete Account. Note that this action is irreversible and all your order history will be lost.' },
    { q: 'How do I manage my saved addresses?', a: 'Go to My Profile > Addresses to add, edit, or delete delivery addresses. You can save multiple addresses and set one as default.' },
    { q: 'Can I merge two accounts?', a: 'Account merging is not supported currently. If you\'ve created multiple accounts, contact support and we\'ll help you consolidate your order history.' },
  ],
}

const categories = Object.keys(faqData)

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('General')
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? Object.values(faqData).flat().filter(item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()))
    : faqData[activeCategory]

  return (
    <>
      <Helmet>
        <title>FAQ - ShopEase Help Center</title>
        <meta name="description" content="Find answers to frequently asked questions about ShopEase — orders, shipping, returns, payments and more." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black font-display mb-4">How Can We Help?</h1>
            <p className="text-primary-100 text-lg mb-8">Find answers to your questions in our comprehensive FAQ.</p>
            <div className="relative max-w-xl mx-auto">
              <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          {!search && (
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {search && (
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong className="text-gray-900 dark:text-white">{search}</strong>"
            </p>
          )}

          <div className="max-w-3xl mx-auto space-y-3">
            {filtered.length > 0 ? filtered.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <AccordionItem q={item.q} a={item.a} />
              </motion.div>
            )) : (
              <div className="text-center py-16 card">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try different keywords or browse the categories above.</p>
                <button onClick={() => setSearch('')} className="btn-primary">Clear Search</button>
              </div>
            )}
          </div>

          {/* Still need help */}
          <div className="mt-16 card p-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Still Need Help?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Our support team is ready to assist you with any question.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="btn-primary">
                <HiChatBubbleLeftRight className="w-4 h-4" /> Contact Support
              </Link>
              <a href="tel:+919876543210" className="btn-secondary">
                <HiPhone className="w-4 h-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
