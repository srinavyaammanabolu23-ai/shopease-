import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiTruck, HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi2'
import { useGetOrderQuery } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { format } from 'date-fns'

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: HiCheckCircle, desc: 'Your order has been placed' },
  { key: 'processing', label: 'Processing', icon: HiClock, desc: 'Preparing your items' },
  { key: 'shipped', label: 'Shipped', icon: HiTruck, desc: 'Order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: HiCheckCircle, desc: 'Enjoy your purchase!' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const OrderTrackingPage = () => {
  const { id } = useParams()
  const { data, isLoading } = useGetOrderQuery(id)
  const order = data?.order

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="xl" /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>

  const currentStepIndex = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <>
      <Helmet><title>Track Order #{order.orderNumber} - ShopEase</title></Helmet>
      <div className="container-custom py-8 max-w-3xl">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">
          Order #{order.orderNumber || id.slice(-8).toUpperCase()}
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Placed on {order.createdAt ? format(new Date(order.createdAt), 'MMMM d, yyyy') : ''}
        </p>

        {/* Progress tracker */}
        {!isCancelled ? (
          <div className="card p-6 mb-6">
            <div className="relative flex justify-between">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0" />
              <div className="absolute top-5 left-0 h-0.5 bg-primary-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (currentStepIndex / (STEPS.length - 1)) * 100)}%` }} />

              {STEPS.map((step, i) => {
                const StepIcon = step.icon
                const done = currentStepIndex >= i + 1
                const active = STATUS_ORDER.indexOf(step.key) === currentStepIndex
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done || active ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400'
                    }`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${done || active ? 'text-primary-600' : 'text-gray-400'}`}>{step.label}</p>
                      <p className="text-[10px] text-gray-400 hidden sm:block">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="card p-6 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <HiXCircle className="w-8 h-8" />
              <div>
                <p className="font-bold">Order Cancelled</p>
                {order.cancelReason && <p className="text-sm">Reason: {order.cancelReason}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Order items */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item._id} className="flex gap-3 items-center">
                  <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                    alt={item.product?.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.product?.name || item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {fmt(item.price)}</p>
                  </div>
                  <span className="text-sm font-semibold">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>{fmt(order.subtotal || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{fmt(order.discount)}</span></div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : fmt(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span><span>{fmt(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Delivery Address</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
                <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                <p>📞 {order.shippingAddress?.phone}</p>
              </div>
            </div>
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Payment</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Method: <span className="capitalize font-medium text-gray-900 dark:text-white">{order.paymentMethod?.replace('_', ' ')}</span></p>
                <p>Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                </span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderTrackingPage
