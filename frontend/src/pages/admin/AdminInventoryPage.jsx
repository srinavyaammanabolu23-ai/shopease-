import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiMagnifyingGlass, HiExclamationTriangle, HiCheckCircle, HiArrowPath } from 'react-icons/hi2'
import { useGetAdminProductsQuery, useUpdateProductStatusMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useGetAdminProductsQuery({ page, limit: 20, search, stock: filter !== 'all' ? filter : undefined })
  const [updateStatus] = useUpdateProductStatusMutation()

  const products = data?.products || []
  const totalPages = data?.totalPages || 1

  const stockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', cls: 'badge-danger', icon: HiExclamationTriangle }
    if (stock <= 10) return { label: 'Low Stock', cls: 'badge-warning', icon: HiExclamationTriangle }
    return { label: 'In Stock', cls: 'badge-success', icon: HiCheckCircle }
  }

  const stats = {
    total: data?.total || 0,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    inStock: products.filter(p => p.stock > 10).length,
  }

  return (
    <>
      <Helmet><title>Inventory - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage product stock levels</p>
        </div>
        <button onClick={refetch} className="btn-secondary"><HiArrowPath className="w-4 h-4" /> Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: stats.total, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'In Stock', value: stats.inStock, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Low Stock', value: stats.lowStock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search products..." className="input pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all', 'All'], ['out', 'Out of Stock'], ['low', 'Low Stock']].map(([val, label]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>{['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map(p => {
                const status = stockStatus(p.stock)
                const StatusIcon = status.icon
                return (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${p.stock === 0 ? 'bg-red-50/30 dark:bg-red-900/10' : p.stock <= 10 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.sku || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{p.category?.name || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white text-sm">₹{Math.round(p.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`text-lg font-black ${p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${status.cls} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="w-3 h-3" /> {status.label}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
              {products.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-gray-400">No products found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-50">Previous</button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </>
  )
}
