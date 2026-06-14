import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiShoppingBag, HiClock, HiTruck, HiCheckCircle,
  HiXCircle, HiEye, HiArrowRight, HiMagnifyingGlass
} from 'react-icons/hi2'
import { useGetMyOrdersQuery, useCancelOrderMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const fmt = n => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    cls: 'badge-warning',  Icon: HiClock },
  confirmed:  { label: 'Confirmed',  cls: 'badge-primary',  Icon: HiCheckCircle },
  processing: { label: 'Processing', cls: 'badge-primary',  Icon: HiClock },
  shipped:    { label: 'Shipped',    cls: 'badge-primary',  Icon: HiTruck },
  delivered:  { label: 'Delivered',  cls: 'badge-success',  Icon: HiCheckCircle },
  cancelled:  { label: 'Cancelled',  cls: 'badge-danger',   Icon: HiXCircle },
  returned:   { label: 'Returned',   cls: 'badge-gray',     Icon: HiXCircle },
}

const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data, isLoading, refetch } = useGetMyOrdersQuery()
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()

  const orders = (data?.orders || []).filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o._id?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await cancelOrder(id).unwrap()
      toast.success('Order cancelled')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel')
    }
  }

  return (
    <>
      <Helmet>
        <title>My Orders - ShopEase</title>
        <meta name="description" content="Track and manage your ShopEase orders" />
      </Helmet>

      <div className="container-custom py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <HiShoppingBag className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">My Orders</h1>
            <p className="text-sm text-gray-500">{data?.orders?.length || 0} total orders</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="card p-4 mb-5 space-y-3">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by order number..." className="input pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {filter !== 'all' ? `No ${filter} orders` : 'No orders yet'}
            </h2>
            <p className="text-gray-500 mb-6">
              {filter !== 'all' ? 'Try a different filter above.' : 'Start shopping and your orders will appear here.'}
            </p>
            <Link to="/products" className="btn-primary">Browse Products <HiArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, i) => {
                const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                return (
                  <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.04 }} className="card p-5 hover:shadow-card-hover transition-shadow">

                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">
                            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                          </span>
                          <span className={`badge ${s.cls} flex items-center gap-1`}>
                            <s.Icon className="w-3 h-3" /> {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a') : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-xl text-gray-900 dark:text-white">
                          {fmt(order.totalAmount ?? order.billing?.total)}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {(order.paymentMethod ?? order.payment?.method)?.replace(/_/g, ' ')}
                        </p>
                        <p className={`text-xs font-medium mt-0.5 ${(order.paymentStatus ?? order.payment?.status) === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {(order.paymentStatus ?? order.payment?.status) === 'paid' ? '✓ Paid' : 'Pending payment'}
                        </p>
                      </div>
                    </div>

                    {/* Product thumbnails */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-2 flex-1 min-w-0 overflow-hidden">
                        {order.items?.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="relative shrink-0">
                            <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/52'}
                              alt={item.product?.name || 'Product'}
                              className="w-13 h-13 w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 dark:border-gray-700" />
                            {item.quantity > 1 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 5 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                            +{order.items.length - 5}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 shrink-0">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Delivery info */}
                    {order.shippingAddress && (
                      <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                        <HiTruck className="w-3.5 h-3.5 shrink-0" />
                        Delivering to {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/orders/${order._id}/track`} className="btn-primary btn-sm">
                        <HiEye className="w-3.5 h-3.5" /> Track Order
                      </Link>
                      {order.status === 'delivered' && (
                        <Link to={`/products`} className="btn-secondary btn-sm">Buy Again</Link>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button onClick={() => handleCancel(order._id)} disabled={cancelling}
                          className="btn-secondary btn-sm text-red-500 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <HiXCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  )
}
