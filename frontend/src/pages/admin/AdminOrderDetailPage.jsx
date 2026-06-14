import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiTruck, HiCheckCircle, HiXCircle, HiMapPin, HiPhone, HiEnvelope } from 'react-icons/hi2'
import { useGetOrderQuery, useUpdateOrderStatusMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STATUS_BADGE = { pending: 'badge-warning', confirmed: 'badge-primary', processing: 'badge-primary', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' }

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const { data, isLoading, refetch } = useGetOrderQuery(id)
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()

  const order = data?.order
  const fmt = n => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

  const handleStatus = async (status) => {
    try { await updateStatus({ id: order._id, status }).unwrap(); toast.success(`Order marked as ${status}`); refetch() }
    catch (err) { toast.error(err?.data?.message || 'Failed to update') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!order) return <div className="card p-12 text-center"><p className="text-gray-500">Order not found.</p></div>

  const stepIndex = STATUS_FLOW.indexOf(order.status)

  return (
    <>
      <Helmet><title>Order #{order.orderNumber || order._id?.slice(-6).toUpperCase()} - Admin</title></Helmet>

      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/orders" className="btn-ghost btn-icon"><HiArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Placed {order.createdAt ? format(new Date(order.createdAt), 'PPp') : ''}
          </p>
        </div>
        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'} capitalize ml-auto text-sm py-1.5 px-3`}>
          {order.status}
        </span>
      </div>

      {/* Status Progress */}
      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6 text-sm">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= stepIndex ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                    {i < stepIndex ? <HiCheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 capitalize font-medium ${i <= stepIndex ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'} transition-all`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items ({order.items?.length})</h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/64'} alt={item.product?.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.product?.name || item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {fmt(item.price)}</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white shrink-0">{fmt(item.quantity * item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Subtotal', value: fmt(order.itemsTotal || order.totalAmount) },
                { label: 'Shipping', value: order.shippingCharge === 0 ? 'FREE' : fmt(order.shippingCharge) },
                { label: 'Tax', value: fmt(order.taxAmount) },
                order.discount && { label: 'Discount', value: `-${fmt(order.discount)}`, cls: 'text-green-600' },
              ].filter(Boolean).map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-medium ${row.cls || 'text-gray-900 dark:text-white'}`}>{row.value}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-base">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600">{fmt(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-1">
                <span>Payment Method</span>
                <span className="capitalize font-medium">{order.paymentMethod?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Payment Status</span>
                <span className={`capitalize font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Customer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-bold">
                {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.user?.name}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <HiEnvelope className="w-4 h-4 shrink-0" /> {order.user?.email}
              </div>
              {order.user?.phone && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <HiPhone className="w-4 h-4 shrink-0" /> {order.user.phone}
              </div>}
            </div>
            <Link to={`/admin/customers/${order.user?._id}`} className="btn-ghost text-xs mt-4 w-full justify-center">
              View Customer →
            </Link>
          </div>

          {/* Delivery Address */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HiMapPin className="w-4 h-4 text-primary-600" /> Delivery Address
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress?.name || order.user?.name}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.pincode}</p>
              {order.shippingAddress?.phone && <p className="flex items-center gap-1"><HiPhone className="w-3 h-3" /> {order.shippingAddress.phone}</p>}
            </div>
          </div>

          {/* Update Status */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Update Status</h2>
              <div className="space-y-2">
                {STATUS_FLOW.slice(STATUS_FLOW.indexOf(order.status) + 1).map(s => (
                  <button key={s} onClick={() => handleStatus(s)} disabled={updating}
                    className="w-full btn-primary py-2 text-sm justify-center capitalize">
                    {updating ? <LoadingSpinner size="sm" color="white" /> : <><HiTruck className="w-4 h-4" /> Mark as {s}</>}
                  </button>
                ))}
                <button onClick={() => handleStatus('cancelled')} disabled={updating}
                  className="w-full btn-secondary py-2 text-sm justify-center text-red-600 border-red-300 hover:bg-red-50">
                  <HiXCircle className="w-4 h-4" /> Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
