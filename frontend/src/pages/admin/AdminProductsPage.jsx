import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiPlus, HiPencil, HiTrash, HiEye, HiMagnifyingGlass,
  HiArrowUpTray, HiCheckCircle, HiXCircle, HiFunnel
} from 'react-icons/hi2'
import { useGetAdminProductsQuery, useDeleteProductMutation, useUpdateProductStatusMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const AdminProductsPage = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const { data, isLoading, isFetching } = useGetAdminProductsQuery({
    page, limit: 15, search, ...(statusFilter && { status: statusFilter })
  })
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation()
  const [updateStatus] = useUpdateProductStatusMutation()

  const products = data?.products || []
  const total = data?.total || 0
  const totalPages = data?.pages || 1

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteProduct(id).unwrap()
      toast.success('Product deleted')
    } catch (err) { toast.error(err?.data?.message || 'Delete failed') }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateStatus({ id, status: currentStatus === 'active' ? 'inactive' : 'active' }).unwrap()
      toast.success('Status updated')
    } catch { toast.error('Update failed') }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([])
    else setSelectedIds(products.map(p => p._id))
  }

  return (
    <>
      <Helmet><title>Products - ShopEase Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
          <span className="badge badge-gray">{total}</span>
        </div>
        <Link to="/admin/products/new" className="btn-primary btn-sm gap-1 w-fit">
          <HiPlus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..." className="input pl-9 text-sm py-2"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="select text-sm py-2 w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="w-10 py-3 px-4 text-left">
                  <input type="checkbox" checked={selectedIds.length === products.length && products.length > 0}
                    onChange={toggleSelectAll} className="rounded" />
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={7} className="py-20 text-center"><LoadingSpinner size="lg" className="mx-auto" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-gray-500">No products found</td></tr>
              ) : products.map(p => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={selectedIds.includes(p._id)}
                      onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, p._id] : prev.filter(id => id !== p._id))}
                      className="rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-xs line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{p.category?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-xs text-gray-900 dark:text-white">{fmt(p.price - p.price * (p.discount || 0) / 100)}</p>
                    {p.discount > 0 && <p className="text-[10px] text-gray-400 line-through">{fmt(p.price)}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium ${p.stock <= 0 ? 'text-red-600' : p.stock <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleToggleStatus(p._id, p.status)}
                      className={`badge cursor-pointer ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {p.status === 'active' ? <HiCheckCircle className="w-3 h-3" /> : <HiXCircle className="w-3 h-3" />}
                      <span className="capitalize">{p.status}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/products/${p.slug}`} target="_blank"
                        className="btn-ghost p-1.5 rounded-lg" title="View on store">
                        <HiEye className="w-3.5 h-3.5" />
                      </Link>
                      <Link to={`/admin/products/${p._id}/edit`}
                        className="btn-ghost p-1.5 rounded-lg text-primary-600" title="Edit">
                        <HiPencil className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} disabled={deleting}
                        className="btn-ghost p-1.5 rounded-lg text-red-500 hover:text-red-700" title="Delete">
                        <HiTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  )
}

export default AdminProductsPage
