import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'acceptance', title: '2. Acceptance of Terms' },
  { id: 'accounts', title: '3. User Accounts' },
  { id: 'products', title: '4. Products & Pricing' },
  { id: 'orders', title: '5. Orders & Payment' },
  { id: 'shipping', title: '6. Shipping & Delivery' },
  { id: 'returns', title: '7. Returns & Refunds' },
  { id: 'ip', title: '8. Intellectual Property' },
  { id: 'privacy', title: '9. Privacy Policy' },
  { id: 'liability', title: '10. Limitation of Liability' },
  { id: 'governing', title: '11. Governing Law' },
  { id: 'changes', title: '12. Changes to Terms' },
  { id: 'contact', title: '13. Contact Us' },
]

export default function TermsPage() {
  const [active, setActive] = useState('introduction')

  return (
    <>
      <Helmet>
        <title>Terms of Service - ShopEase</title>
        <meta name="description" content="Read ShopEase's Terms of Service to understand your rights and obligations when using our platform." />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl font-black font-display mb-3">Terms of Service</h1>
          <p className="text-gray-400">Last updated: January 1, 2025 &nbsp;·&nbsp; Effective: January 1, 2025</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex gap-10">
          {/* Sticky TOC */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 card p-5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Table of Contents</p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)}
                    className={`block py-1.5 px-3 rounded-lg text-sm transition-colors ${active === s.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 prose prose-gray dark:prose-invert max-w-none">
            <div className="card p-8 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">

              <section id="introduction">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
                <p>Welcome to ShopEase ("Company", "we", "our", "us"). These Terms of Service govern your use of our website located at <strong>www.shopease.com</strong> and our mobile application (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part, you may not access the Service.</p>
              </section>

              <section id="acceptance">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Acceptance of Terms</h2>
                <p>By creating an account, browsing our website, or making a purchase, you confirm that you are at least 18 years of age, have read and understood these Terms, and agree to be legally bound by them. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
              </section>

              <section id="accounts">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Accounts</h2>
                <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at <strong>support@shopease.com</strong> of any unauthorized use of your account. ShopEase reserves the right to terminate accounts that violate our policies.</p>
              </section>

              <section id="products">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Products & Pricing</h2>
                <p>We reserve the right to modify product listings, descriptions, and pricing at any time without notice. While we strive to ensure accuracy, we do not warrant that product descriptions, images, or prices are accurate, complete, or error-free. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price and notify you accordingly.</p>
                <p className="mt-3">All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. Additional charges such as shipping fees may apply and will be displayed at checkout.</p>
              </section>

              <section id="orders">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Orders & Payment</h2>
                <p>By placing an order, you make an offer to purchase the selected products subject to these Terms. We reserve the right to accept or decline any order. Your order is confirmed only upon receipt of our confirmation email. Payment must be made in full at the time of purchase using our supported payment methods including UPI, credit/debit cards, net banking, and Cash on Delivery (where available).</p>
              </section>

              <section id="shipping">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Shipping & Delivery</h2>
                <p>Delivery timeframes are estimates and not guaranteed. ShopEase is not liable for delays caused by courier partners, natural disasters, public holidays, or other events beyond our control. Risk of loss and title for items transfer to you upon delivery. We deliver across 500+ cities in India. Delivery availability and charges vary by location.</p>
              </section>

              <section id="returns">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Returns & Refunds</h2>
                <p>Our return and refund policy is detailed on our <Link to="/returns" className="text-primary-600 hover:underline">Return Policy page</Link>. In general, most items can be returned within 30 days of delivery if unused and in original packaging. Refunds are processed to the original payment method within 5–7 business days of receiving the returned item.</p>
              </section>

              <section id="ip">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Intellectual Property</h2>
                <p>All content on ShopEase — including logos, text, graphics, images, software, and other material — is the property of ShopEase or its content suppliers and protected by Indian and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
              </section>

              <section id="privacy">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Privacy Policy</h2>
                <p>Your use of the Service is also governed by our <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection, use, and protection of your personal information.</p>
              </section>

              <section id="liability">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, ShopEase shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service. Our total liability to you for any claim shall not exceed the amount paid by you for the specific product or service giving rise to the claim.</p>
              </section>

              <section id="governing">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of India, specifically the Information Technology Act, 2000, and the Consumer Protection Act, 2019. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
              </section>

              <section id="changes">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">12. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms at any time. We will provide at least 30 days notice before any major changes take effect by posting the updated Terms on this page and sending a notification to your registered email. Your continued use of the Service after changes constitute acceptance of the new Terms.</p>
              </section>

              <section id="contact">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">13. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mt-4 space-y-2 not-prose">
                  <p className="text-sm"><strong className="text-gray-900 dark:text-white">ShopEase India Pvt. Ltd.</strong></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">123 Commerce Street, Andheri West, Mumbai, Maharashtra 400053</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email: <a href="mailto:legal@shopease.com" className="text-primary-600 hover:underline">legal@shopease.com</a></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone: +91 98765 43210</p>
                </div>
              </section>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
