import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiPlus, HiPencilSquare, HiTrash, HiXMark, HiCheckCircle, HiReceiptPercent, HiMagnifyingGlass } from 'react-icons/hi2'
import {
  useGetCouponsQuery, useCreateCouponMutation,
  useUpdateCouponMutation, useDeleteCouponMutation
} from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const emptyForm = {
  code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '',
  maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true, description: ''
}

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading, refetch } = useGetCouponsQuery()
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation()
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation()
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation()

  const coupons = (data?.coupons || []).filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (c) => {
    setEditItem(c)
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '', expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : '',
      isActive: c.isActive, description: c.description || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) || 0, maxDiscount: Number(form.maxDiscount) || undefined, usageLimit: Number(form.usageLimit) || undefined }
      if (editItem) { await updateCoupon({ id: editItem._id, ...payload }).unwrap(); toast.success('Coupon updated!') }
      else { await createCoupon(payload).unwrap(); toast.success('Coupon created!') }
      setModalOpen(false); refetch()
    } catch (err) { toast.error(err?.data?.message || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    try { await deleteCoupon(id).unwrap(); toast.success('Coupon deleted'); setDeleteId(null); refetch() }
    catch (err) { toast.error(err?.data?.message || 'Failed to delete') }
  }

  const isExpired = (date) => date && new Date(date) < new Date()

  return (
    <>
      <Helmet><title>Coupons - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons.length} coupons total</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><HiPlus className="w-4 h-4" /> Add Coupon</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Coupons', value: data?.coupons?.length || 0, color: 'text-primary-600' },
          { label: 'Active', value: data?.coupons?.filter(c => c.isActive)?.length || 0, color: 'text-green-600' },
          { label: 'Expired', value: data?.coupons?.filter(c => isExpired(c.expiryDate))?.length || 0, color: 'text-red-500' },
          { label: 'Total Used', value: data?.coupons?.reduce((s, c) => s + (c.usedCount || 0), 0) || 0, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6">
        <div className="relative max-w-sm">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code..." className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>{['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {coupons.map(c => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <HiReceiptPercent className="w-4 h-4 text-primary-500" />
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{c.code}</span>
                    </div>
                    {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    {c.maxDiscount && <span className="text-xs text-gray-400 ml-1">(max ₹{c.maxDiscount})</span>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">₹{c.minOrderAmount || 0}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="text-gray-900 dark:text-white font-medium">{c.usedCount || 0}</span>
                    {c.usageLimit && <span className="text-gray-400">/{c.usageLimit}</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {c.expiryDate ? (
                      <span className={isExpired(c.expiryDate) ? 'text-red-500 font-medium' : ''}>
                        {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                        {isExpired(c.expiryDate) && ' (expired)'}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${c.isActive && !isExpired(c.expiryDate) ? 'badge-success' : 'badge-danger'}`}>
                      {c.isActive && !isExpired(c.expiryDate) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 transition-colors"><HiPencilSquare className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No coupons found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editItem ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon"><HiXMark className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required className="input font-mono uppercase" placeholder="SAVE20" /></div>
                <div><label className="label">Type *</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required min="1" className="input" /></div>
                <div><label className="label">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="input" placeholder="Optional" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className="input" placeholder="0" /></div>
                <div><label className="label">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input" placeholder="Unlimited" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="input" /></div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>
              <div><label className="label">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" placeholder="Optional description" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating || updating} className="btn-primary flex-1 justify-center">
                  {(creating || updating) ? <LoadingSpinner size="sm" color="white" /> : <><HiCheckCircle className="w-4 h-4" />{editItem ? 'Update' : 'Create'}</>}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card p-6 w-full max-w-sm mx-4 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiTrash className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Coupon?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="btn-danger flex-1 justify-center">
                {deleting ? <LoadingSpinner size="sm" color="white" /> : 'Delete'}
              </button>
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
