import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { HiMagnifyingGlass, HiEye, HiChevronDown } from 'react-icons/hi2'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Pagination from '../../components/ui/Pagination'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-primary', processing: 'badge-primary',
  shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger',
}

const AdminOrdersPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [editingStatus, setEditingStatus] = useState(null)

  const { data, isLoading } = useGetAllOrdersQuery({ page, limit: 15, search, status, sort: 'createdAt', sortOrder: -1 })
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()

  const orders = data?.orders || []
  const totalPages = data?.pages || 1
  const total = data?.total || 0

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap()
      toast.success('Order status updated')
      setEditingStatus(null)
    } catch (err) { toast.error(err?.data?.message || 'Failed to update') }
  }

  return (
    <>
      <Helmet><title>Orders - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <span className="badge badge-gray">{total}</span>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
        <button onClick={() => { setStatus(''); setPage(1) }}
          className={`btn-sm whitespace-nowrap ${!status ? 'btn-primary' : 'btn-secondary'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`btn-sm whitespace-nowrap capitalize ${status === s ? 'btn-primary' : 'btn-secondary'}`}>{s}</button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-3 mb-4">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by order #, customer name or email..."
            className="input pl-9 text-sm py-2" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={8} className="py-20 text-center"><LoadingSpinner size="lg" className="mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                    #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-xs text-gray-900 dark:text-white">{order.user?.name}</p>
                    <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{order.items?.length || 0} items</td>
                  <td className="py-3 px-4 font-semibold text-xs text-gray-900 dark:text-white">{fmt(order.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <span className={`badge text-[10px] ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {editingStatus === order._id ? (
                      <select value={order.status}
                        onChange={e => handleStatusUpdate(order._id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        autoFocus className="select text-xs py-1 w-32"
                        disabled={updating}>
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditingStatus(order._id)}
                        className={`badge cursor-pointer ${STATUS_BADGE[order.status] || 'badge-gray'} gap-1`}>
                        <span className="capitalize text-[10px]">{order.status}</span>
                        <HiChevronDown className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-gray-400">
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : ''}
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/admin/orders/${order._id}`} className="btn-ghost p-1.5 rounded-lg text-primary-600">
                      <HiEye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  )
}

export default AdminOrdersPage
