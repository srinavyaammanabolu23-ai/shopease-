import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const sections = [
  { id: 'collect', title: '1. Information We Collect' },
  { id: 'use', title: '2. How We Use Your Information' },
  { id: 'sharing', title: '3. Information Sharing' },
  { id: 'security', title: '4. Data Security' },
  { id: 'cookies', title: '5. Cookies & Tracking' },
  { id: 'rights', title: '6. Your Rights' },
  { id: 'children', title: "7. Children's Privacy" },
  { id: 'changes', title: '8. Changes to This Policy' },
  { id: 'contact', title: '9. Contact Us' },
]

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - ShopEase</title>
        <meta name="description" content="Learn how ShopEase collects, uses, and protects your personal information." />
      </Helmet>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl font-black font-display mb-3">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: January 1, 2025 &nbsp;·&nbsp; Effective: January 1, 2025</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex gap-10">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 card p-5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Table of Contents</p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="flex-1">
            <div className="card p-8 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className="text-gray-500 dark:text-gray-400 italic">At ShopEase, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>

              <section id="collect">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
                <p className="mb-3">We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li><strong className="text-gray-800 dark:text-gray-200">Account Information:</strong> Name, email address, password, phone number</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Profile Information:</strong> Delivery addresses, date of birth, gender preferences</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Transaction Data:</strong> Purchase history, payment method details (encrypted), order details</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Communications:</strong> Messages with customer support, product reviews, feedback</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Usage Data:</strong> Pages visited, products viewed, search queries, time spent on platform</li>
                </ul>
              </section>

              <section id="use">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
                <p className="mb-3">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Process and fulfill your orders and send order confirmations</li>
                  <li>Manage your account and provide customer support</li>
                  <li>Send transactional notifications (shipping updates, payment receipts)</li>
                  <li>Personalize your shopping experience and recommend products</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Detect and prevent fraud, abuse, and security incidents</li>
                  <li>Comply with legal obligations and enforce our Terms of Service</li>
                  <li>Analyze and improve our platform's performance and features</li>
                </ul>
              </section>

              <section id="sharing">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Information Sharing</h2>
                <p className="mb-3">We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li><strong className="text-gray-800 dark:text-gray-200">Delivery Partners:</strong> Name and address for order delivery</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Payment Processors:</strong> Encrypted payment details to process transactions securely</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Analytics Providers:</strong> Anonymized usage data to improve our services</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Legal Authorities:</strong> When required by law, court order, or government authority</li>
                </ul>
              </section>

              <section id="security">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Data Security</h2>
                <p>We implement industry-standard security measures to protect your personal information, including SSL/TLS encryption for data transmission, AES-256 encryption for stored sensitive data, regular security audits and penetration testing, two-factor authentication options, and PCI-DSS compliant payment processing. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
              </section>

              <section id="cookies">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Cookies & Tracking</h2>
                <p className="mb-3">We use cookies and similar tracking technologies to enhance your experience:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li><strong className="text-gray-800 dark:text-gray-200">Essential Cookies:</strong> Required for the platform to function (login session, cart)</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Analytics Cookies:</strong> Help us understand how visitors use our platform</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Preference Cookies:</strong> Remember your settings like language and theme</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Marketing Cookies:</strong> Used to show relevant ads (opt-out available in settings)</li>
                </ul>
                <p className="mt-3">You can control cookies through your browser settings. Note that disabling cookies may affect platform functionality.</p>
              </section>

              <section id="rights">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
                <p className="mb-3">Under applicable data protection laws, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li><strong className="text-gray-800 dark:text-gray-200">Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Correction:</strong> Update inaccurate or incomplete personal information</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong className="text-gray-800 dark:text-gray-200">Portability:</strong> Receive your data in a structured, machine-readable format</li>
                </ul>
                <p className="mt-3">To exercise these rights, email us at <a href="mailto:privacy@shopease.com" className="text-primary-600 hover:underline">privacy@shopease.com</a>.</p>
              </section>

              <section id="children">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Children's Privacy</h2>
                <p>ShopEase is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately and we will take prompt steps to delete such information.</p>
              </section>

              <section id="changes">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. The updated policy will be effective from the date posted. We encourage you to review this policy periodically.</p>
              </section>

              <section id="contact">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Contact Us</h2>
                <p>For privacy-related questions or to exercise your rights, contact our Data Protection Officer:</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mt-4 space-y-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Data Protection Officer — ShopEase India Pvt. Ltd.</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email: <a href="mailto:privacy@shopease.com" className="text-primary-600 hover:underline">privacy@shopease.com</a></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address: 123 Commerce Street, Andheri West, Mumbai 400053</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Response time: Within 30 days</p>
                </div>
              </section>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
