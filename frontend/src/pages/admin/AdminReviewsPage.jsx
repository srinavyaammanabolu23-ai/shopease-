import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiMagnifyingGlass, HiStar, HiCheckCircle, HiXCircle, HiTrash, HiEye } from 'react-icons/hi2'
import { useGetAllReviewsQuery, useUpdateReviewStatusMutation, useDeleteReviewMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const stars = (n) => Array.from({ length: 5 }, (_, i) => (
  <HiStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(n) ? 'text-amber-400' : 'text-gray-300'}`} />
))

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewReview, setViewReview] = useState(null)

  const { data, isLoading, refetch } = useGetAllReviewsQuery({ page, limit: 15, status: statusFilter !== 'all' ? statusFilter : undefined, search })
  const [updateStatus, { isLoading: updating }] = useUpdateReviewStatusMutation()
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation()

  const reviews = data?.reviews || []
  const totalPages = data?.totalPages || 1

  const handleStatus = async (id, status) => {
    try { await updateStatus({ id, status }).unwrap(); toast.success(`Review ${status}`); refetch() }
    catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try { await deleteReview(id).unwrap(); toast.success('Review deleted'); refetch() }
    catch { toast.error('Failed to delete') }
  }

  const statusBadge = (s) => {
    if (s === 'approved') return 'badge-success'
    if (s === 'rejected') return 'badge-danger'
    return 'badge-warning'
  }

  return (
    <>
      <Helmet><title>Reviews - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Moderate customer product reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search reviews..." className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
            <button key={val} onClick={() => { setStatusFilter(val); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
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
              <tr>{['Customer', 'Product', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reviews.map(r => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{r.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{r.user?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[150px]">{r.product?.name || '—'}</p>
                  </td>
                  <td className="py-3 px-4"><div className="flex">{stars(r.rating)}</div></td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-[200px]">{r.comment}</p>
                    {r.title && <p className="text-xs font-medium text-gray-900 dark:text-white mt-0.5">{r.title}</p>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusBadge(r.status)} capitalize`}>{r.status || 'pending'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setViewReview(r)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 transition-colors" title="View">
                        <HiEye className="w-4 h-4" />
                      </button>
                      {r.status !== 'approved' && (
                        <button onClick={() => handleStatus(r._id, 'approved')} disabled={updating}
                          className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 transition-colors" title="Approve">
                          <HiCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button onClick={() => handleStatus(r._id, 'rejected')} disabled={updating}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Reject">
                          <HiXCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(r._id)} disabled={deleting}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Delete">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No reviews found</td></tr>}
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

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setViewReview(null)}>
          <div className="card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Review Detail</h3>
              <button onClick={() => setViewReview(null)} className="btn-ghost btn-icon text-gray-400"><HiXCircle className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex">{stars(viewReview.rating)}</div>
              {viewReview.title && <p className="font-semibold text-gray-900 dark:text-white">{viewReview.title}</p>}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{viewReview.comment}</p>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">By <span className="font-medium text-gray-700 dark:text-gray-300">{viewReview.user?.name}</span> on {viewReview.product?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{viewReview.createdAt ? new Date(viewReview.createdAt).toLocaleString('en-IN') : ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
