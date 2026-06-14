import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  HiMapPin, HiPhone, HiEnvelope, HiClock,
  HiChatBubbleLeftRight, HiCheckCircle, HiPaperAirplane,
  HiGlobeAlt, HiCamera
} from 'react-icons/hi2'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

const subjects = ['General Inquiry', 'Order Support', 'Return & Refund', 'Product Question', 'Partnership', 'Feedback', 'Other']

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <>
      <Helmet>
        <title>Contact Us - ShopEase</title>
        <meta name="description" content="Get in touch with ShopEase support. We're here to help 24/7." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white py-20">
        <div className="container-custom text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-4xl md:text-5xl font-black font-display mb-4">Get In Touch</h1>
            <p className="text-primary-100 text-lg max-w-xl mx-auto">
              Have a question or need help? Our support team is available 24/7 and happy to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="lg:col-span-3 card p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiCheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Message Sent!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Thanks for reaching out, <strong>{form.name}</strong>! We'll get back to you at <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                    className="btn-primary">Send Another Message</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send Us a Message</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">We typically respond within a few hours.</p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} required
                          className="input" placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required
                          className="input" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label">Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleChange}
                          className="input" placeholder="+91 98765 43210" />
                      </div>
                      <div>
                        <label className="label">Subject *</label>
                        <select name="subject" value={form.subject} onChange={handleChange} required className="input">
                          <option value="">Select a subject</option>
                          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Message *</label>
                      <textarea name="message" value={form.message} onChange={handleChange} required
                        className="input resize-none h-36" placeholder="Describe your question or issue in detail..." />
                    </div>
                    <button type="submit" disabled={loading}
                      className="btn-primary w-full py-3 text-base justify-center">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><HiPaperAirplane className="w-4 h-4" /> Send Message</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-5">
              {[
                { icon: HiMapPin, title: 'Our Office', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', detail: '123 Commerce Street\nAndheri West, Mumbai\nMaharashtra 400053' },
                { icon: HiPhone, title: 'Phone', color: 'bg-green-100 dark:bg-green-900/30 text-green-600', detail: '+91 98765 43210\n+91 98765 43211' },
                { icon: HiEnvelope, title: 'Email', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', detail: 'support@shopease.com\nhelp@shopease.com' },
                { icon: HiClock, title: 'Working Hours', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', detail: 'Mon–Sat: 9:00 AM – 8:00 PM\nSunday: 10:00 AM – 6:00 PM' },
              ].map(item => (
                <div key={item.title} className="card p-5 flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</p>
                    {item.detail.split('\n').map((line, i) => (
                      <p key={i} className="text-sm text-gray-500 dark:text-gray-400">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {/* Social links */}
              <div className="card p-5">
                <p className="font-bold text-gray-900 dark:text-white mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { Icon: HiGlobeAlt, label: 'Facebook', color: 'hover:bg-blue-600' },
                    { Icon: HiCamera, label: 'Instagram', color: 'hover:bg-pink-600' },
                    { Icon: HiChatBubbleLeftRight, label: 'WhatsApp', color: 'hover:bg-green-600' },
                  ].map(({ Icon, label, color }) => (
                    <button key={label} aria-label={label}
                      className={`w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white transition-all ${color}`}>
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Cards */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: HiChatBubbleLeftRight, title: 'Live Chat', desc: 'Chat with our support team in real-time. Available Mon–Sat 9AM–8PM.', action: 'Start Chat', color: 'from-primary-500 to-primary-600' },
              { icon: HiPhone, title: 'Call Us', desc: 'Speak directly with a support agent. Toll-free and quick response guaranteed.', action: 'Call Now', color: 'from-green-500 to-green-600' },
              { icon: HiEnvelope, title: 'Email Support', desc: 'Send us a detailed email and get a comprehensive response within 24 hours.', action: 'Send Email', color: 'from-accent-500 to-accent-600' },
            ].map((card, i) => (
              <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="card p-8 text-center group hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 leading-relaxed">{card.desc}</p>
                <button className="btn-primary btn-sm">{card.action}</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
