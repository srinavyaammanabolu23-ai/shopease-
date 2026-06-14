import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HiArrowPath, HiTruck, HiBanknotes, HiCheckCircle,
  HiXCircle, HiChevronDown, HiPhone, HiEnvelope
} from 'react-icons/hi2'

const steps = [
  { step: '01', icon: HiArrowPath, title: 'Request Return', desc: 'Go to My Orders, select your item, and click "Return". Choose a reason and select pickup date.' },
  { step: '02', icon: HiTruck, title: 'Pack & Pickup', desc: 'Pack the item securely in original packaging. Our courier partner will pick it up from your doorstep.' },
  { step: '03', icon: HiBanknotes, title: 'Get Refund', desc: 'Once we receive and inspect your item, the refund is processed within 5–7 business days.' },
]

const eligible = [
  'Item received in damaged or defective condition',
  'Wrong product delivered',
  'Product description mismatch',
  'Missing parts or accessories',
  'Unused item within 30 days with original packaging',
  'All tags and labels intact',
]

const notEligible = [
  'Innerwear, lingerie, and swimwear',
  'Perishable goods and food items',
  'Digital downloads and software',
  'Customized or personalized products',
  'Fragile items broken due to mishandling after delivery',
  'Items returned after 30 days of delivery',
]

const refundTimeline = [
  { method: 'UPI / Net Banking', time: '1–3 business days' },
  { method: 'Credit / Debit Card', time: '5–7 business days' },
  { method: 'ShopEase Wallet', time: 'Instant' },
  { method: 'Cash on Delivery (refund to wallet)', time: 'Instant after approval' },
  { method: 'EMI (reversed to card)', time: '7–10 business days' },
]

const faqs = [
  { q: 'Can I return a product without the original box?', a: 'Original packaging is preferred but not always mandatory. However, the product must be securely packed to avoid damage during transit. Items requiring original packaging (e.g., electronics) must be returned in it.' },
  { q: 'What if my return is rejected?', a: 'If a return is rejected (e.g., item shows signs of use), we will notify you via email with the reason and return the item to you at no cost.' },
  { q: 'Can I return part of a bundle?', a: 'Bundle products must be returned as a complete set. Partial returns of bundled items are not accepted.' },
  { q: 'How do I track my return?', a: 'Once your return pickup is scheduled, you will receive a tracking link via email and SMS to monitor your return shipment status.' },
  { q: 'What if I receive a refund less than the product price?', a: 'Shipping charges, COD fees, and applicable return shipping charges may be deducted from the refund amount. You will see the refund breakdown in your return confirmation email.' },
]

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}><HiChevronDown className="w-5 h-5 text-gray-500 shrink-0" /></motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ReturnPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Return Policy - ShopEase 30-Day Easy Returns</title>
        <meta name="description" content="ShopEase offers hassle-free 30-day returns. Learn about our return process, eligible items, and refund timeline." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-primary-700 text-white py-20">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-7xl font-black font-display mb-2">30</div>
            <div className="text-2xl font-bold mb-4">Day Easy Returns</div>
            <p className="text-green-100 text-lg max-w-xl mx-auto">
              Not satisfied? No worries. We offer free, hassle-free returns on most products within 30 days of delivery — no questions asked.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3-step process */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">How Returns Work</h2>
            <p className="section-subtitle">3 simple steps to return your item</p>
          </div>
          <div className="relative mt-14">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-900 dark:via-primary-600 dark:to-primary-900" />
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="relative inline-block mb-5">
                    <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary-200 dark:shadow-primary-900">
                      <s.icon className="w-9 h-9 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent-500 text-white text-xs font-black rounded-full flex items-center justify-center">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <HiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eligible for Return</h2>
              </div>
              <ul className="space-y-3">
                {eligible.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <HiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <HiXCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Not Returnable</h2>
              </div>
              <ul className="space-y-3">
                {notEligible.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <HiXCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Timeline */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom max-w-3xl">
          <div className="section-header">
            <h2 className="section-title">Refund Timeline</h2>
            <p className="section-subtitle">When to expect your money back based on payment method</p>
          </div>
          <div className="mt-10 card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="table-header">Payment Method</th>
                  <th className="table-header">Refund Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {refundTimeline.map(row => (
                  <tr key={row.method} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="table-cell font-medium">{row.method}</td>
                    <td className="table-cell">
                      <span className="badge badge-success">{row.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">* Refund timeline starts after we receive and approve your returned item</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom max-w-3xl">
          <div className="section-header">
            <h2 className="section-title">Return FAQs</h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-50 dark:bg-primary-900/20">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need Help with a Return?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Our support team is available 7 days a week to assist you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary">
              <HiEnvelope className="w-4 h-4" /> Contact Support
            </Link>
            <a href="tel:+919876543210" className="btn-secondary">
              <HiPhone className="w-4 h-4" /> +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
