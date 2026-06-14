import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiPlus, HiPencilSquare, HiTrash, HiTag, HiMagnifyingGlass, HiXMark, HiCheckCircle } from 'react-icons/hi2'
import {
  useGetCategoriesQuery, useCreateCategoryMutation,
  useUpdateCategoryMutation, useDeleteCategoryMutation
} from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const emptyForm = { name: '', slug: '', icon: '', description: '', isActive: true }

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading, refetch } = useGetCategoriesQuery({ flat: true })
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation()

  const categories = (data?.categories || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (cat) => { setEditItem(cat); setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', description: cat.description || '', isActive: cat.isActive ?? true }); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editItem) {
        await updateCategory({ id: editItem._id, ...form }).unwrap()
        toast.success('Category updated!')
      } else {
        await createCategory(form).unwrap()
        toast.success('Category created!')
      }
      setModalOpen(false)
      refetch()
    } catch (err) { toast.error(err?.data?.message || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id).unwrap()
      toast.success('Category deleted')
      setDeleteId(null)
      refetch()
    } catch (err) { toast.error(err?.data?.message || 'Failed to delete') }
  }

  return (
    <>
      <Helmet><title>Categories - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories found</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <HiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative max-w-sm">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..." className="input pl-9" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Icon', 'Name', 'Slug', 'Products', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map(cat => (
                <motion.tr key={cat._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-2xl">{cat.icon || <HiTag className="w-5 h-5 text-gray-400" />}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{cat.productCount || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${cat.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 transition-colors">
                        <HiPencilSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No categories found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editItem ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon"><HiXMark className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} required className="input" placeholder="e.g. Electronics" /></div>
              <div><label className="label">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input font-mono" placeholder="e.g. electronics" /></div>
              <div><label className="label">Icon (emoji)</label>
                <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input" placeholder="e.g. 📱" /></div>
              <div><label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input resize-none h-20" placeholder="Short description..." /></div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
              </div>
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
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Category?</h3>
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
