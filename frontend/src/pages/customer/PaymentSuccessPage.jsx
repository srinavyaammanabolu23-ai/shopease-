import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiXCircle, HiShoppingBag, HiArrowRight, HiCreditCard } from 'react-icons/hi2'
import { useVerifyPaymentMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

const PaymentSuccessPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [verifyPayment, { isLoading, error }] = useVerifyPaymentMutation()
  const [order, setOrder] = useState(null)
  const [verificationError, setVerificationError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setVerificationError('No payment session found.')
      return
    }

    const verify = async () => {
      try {
        const res = await verifyPayment({ sessionId }).unwrap()
        if (res.success) {
          setOrder(res.order)
        } else {
          setVerificationError(res.message || 'Payment verification failed.')
        }
      } catch (err) {
        setVerificationError(err?.data?.message || 'Error occurred while verifying payment.')
      }
    }

    verify()
  }, [sessionId, verifyPayment])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingSpinner size="xl" />
        <h2 className="text-xl font-bold mt-6 text-gray-900 dark:text-white">Verifying your payment...</h2>
        <p className="text-gray-500 mt-2 text-sm max-w-md">Please do not close this window or refresh the page while we confirm your transaction with Stripe.</p>
      </div>
    )
  }

  if (verificationError || error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card max-w-md w-full p-8 text-center border-t-4 border-red-500">
          <HiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            {verificationError || 'Something went wrong while confirming your payment. Please contact customer support.'}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/checkout" className="btn-primary justify-center">Try Checkout Again</Link>
            <Link to="/" className="btn-ghost justify-center text-sm">Go to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Payment Successful - ShopEase</title>
      </Helmet>

      <div className="container-custom py-12 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-xl w-full p-8 text-center relative overflow-hidden"
        >
          {/* Top colored accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />

          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Thank you for your purchase. Your payment was processed successfully.
          </p>

          {order && (
            <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-left mb-6 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <p className="text-gray-400">Order Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Amount Paid</p>
                  <p className="font-bold text-gray-900 dark:text-white">{fmt(order.billing?.total || order.totalAmount)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items Purchased</p>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 dark:text-gray-400 truncate mr-4">
                        {item.name} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {order && (
              <Link to={`/orders/${order._id}/track`} className="btn-primary justify-center">
                Track Order <HiArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
            <Link to="/products" className="btn-secondary justify-center">
              <HiShoppingBag className="w-4 h-4 mr-1.5" /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default PaymentSuccessPage
