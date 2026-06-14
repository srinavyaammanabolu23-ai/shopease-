import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiCog, HiShieldCheck, HiTruck, HiBell, HiGlobeAlt, HiCheckCircle } from 'react-icons/hi2'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'general', label: 'General', icon: HiCog },
  { id: 'shipping', label: 'Shipping', icon: HiTruck },
  { id: 'notifications', label: 'Notifications', icon: HiBell },
  { id: 'seo', label: 'SEO', icon: HiGlobeAlt },
  { id: 'security', label: 'Security', icon: HiShieldCheck },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    storeName: 'ShopEase',
    storeEmail: 'support@shopease.com',
    storePhone: '+91 98765 43210',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    logo: '',
    freeShippingThreshold: 499,
    standardShippingRate: 49,
    expressShippingRate: 99,
    codEnabled: true,
    codFee: 30,
    orderNotifications: true,
    reviewNotifications: true,
    lowStockThreshold: 10,
    lowStockNotifications: true,
    metaTitle: 'ShopEase - Your One-Stop Shopping Destination',
    metaDescription: 'Shop the latest products at unbeatable prices. Free shipping on orders above ₹499.',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxLoginAttempts: 5,
  })

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved successfully!')
    setTimeout(() => setSaved(false), 3000)
  }

  const Field = ({ label, helper, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {helper && <p className="text-xs text-gray-400 mt-1">{helper}</p>}
    </div>
  )

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="font-medium text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )

  return (
    <>
      <Helmet><title>Settings - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your store preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <LoadingSpinner size="sm" color="white" /> : saved ? <><HiCheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-52 shrink-0">
          <div className="card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <div className="card p-6 space-y-5">

            {activeTab === 'general' && (
              <>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">General Settings</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Store Name"><input value={settings.storeName} onChange={e => set('storeName', e.target.value)} className="input" /></Field>
                  <Field label="Store Email"><input type="email" value={settings.storeEmail} onChange={e => set('storeEmail', e.target.value)} className="input" /></Field>
                  <Field label="Store Phone"><input value={settings.storePhone} onChange={e => set('storePhone', e.target.value)} className="input" /></Field>
                  <Field label="Currency">
                    <select value={settings.currency} onChange={e => set('currency', e.target.value)} className="input">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </Field>
                  <Field label="Timezone">
                    <select value={settings.timezone} onChange={e => set('timezone', e.target.value)} className="input">
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </Field>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <Toggle label="Maintenance Mode" desc="Show maintenance page to visitors while you update the store" value={settings.maintenanceMode} onChange={v => set('maintenanceMode', v)} />
                  <Toggle label="Allow New Registrations" desc="Let new users create accounts on your store" value={settings.allowRegistration} onChange={v => set('allowRegistration', v)} />
                </div>
              </>
            )}

            {activeTab === 'shipping' && (
              <>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Shipping Settings</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Free Shipping Threshold (₹)" helper="Orders above this amount get free shipping">
                    <input type="number" value={settings.freeShippingThreshold} onChange={e => set('freeShippingThreshold', Number(e.target.value))} className="input" />
                  </Field>
                  <Field label="Standard Shipping Rate (₹)">
                    <input type="number" value={settings.standardShippingRate} onChange={e => set('standardShippingRate', Number(e.target.value))} className="input" />
                  </Field>
                  <Field label="Express Shipping Rate (₹)">
                    <input type="number" value={settings.expressShippingRate} onChange={e => set('expressShippingRate', Number(e.target.value))} className="input" />
                  </Field>
                  <Field label="COD Fee (₹)" helper="Extra fee for Cash on Delivery orders">
                    <input type="number" value={settings.codFee} onChange={e => set('codFee', Number(e.target.value))} className="input" />
                  </Field>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <Toggle label="Cash on Delivery" desc="Allow customers to pay cash on delivery" value={settings.codEnabled} onChange={v => set('codEnabled', v)} />
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Notification Settings</h2>
                <Toggle label="New Order Notifications" desc="Get notified when a new order is placed" value={settings.orderNotifications} onChange={v => set('orderNotifications', v)} />
                <Toggle label="New Review Notifications" desc="Get notified when a customer leaves a review" value={settings.reviewNotifications} onChange={v => set('reviewNotifications', v)} />
                <Toggle label="Low Stock Alerts" desc="Get notified when product stock falls below threshold" value={settings.lowStockNotifications} onChange={v => set('lowStockNotifications', v)} />
                <div className="pt-2">
                  <Field label="Low Stock Alert Threshold" helper="Notify when stock falls below this number">
                    <input type="number" value={settings.lowStockThreshold} onChange={e => set('lowStockThreshold', Number(e.target.value))} className="input max-w-xs" />
                  </Field>
                </div>
              </>
            )}

            {activeTab === 'seo' && (
              <>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">SEO Settings</h2>
                <Field label="Meta Title"><input value={settings.metaTitle} onChange={e => set('metaTitle', e.target.value)} className="input" placeholder="Store title for search engines" /></Field>
                <Field label="Meta Description" helper="160 characters recommended">
                  <textarea value={settings.metaDescription} onChange={e => set('metaDescription', e.target.value)} className="input resize-none h-24" />
                  <p className="text-xs text-gray-400 mt-1">{settings.metaDescription.length} / 160 characters</p>
                </Field>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Security Settings</h2>
                <Toggle label="Require Email Verification" desc="New users must verify their email before logging in" value={settings.requireEmailVerification} onChange={v => set('requireEmailVerification', v)} />
                <div className="pt-2">
                  <Field label="Max Login Attempts" helper="Account is locked after this many failed attempts">
                    <input type="number" value={settings.maxLoginAttempts} onChange={e => set('maxLoginAttempts', Number(e.target.value))} className="input max-w-xs" min={3} max={10} />
                  </Field>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-2">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">⚠️ Security Note</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Always use strong passwords and enable two-factor authentication for admin accounts.</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
