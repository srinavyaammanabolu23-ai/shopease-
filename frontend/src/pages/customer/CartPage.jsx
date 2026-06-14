import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  HiPlus, HiMinus, HiTrash, HiArrowRight, HiShoppingCart,
  HiTag, HiXMark, HiCheckCircle, HiShieldCheck, HiTruck
} from 'react-icons/hi2'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import {
  useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation,
  useClearCartMutation, useApplyCouponMutation, useRemoveCouponMutation
} from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

const CartPage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [couponInput, setCouponInput] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)

  const { data, isLoading, error } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const [updateItem] = useUpdateCartItemMutation()
  const [removeItem] = useRemoveFromCartMutation()
  const [clearCart] = useClearCartMutation()
  const [applyCoupon, { isLoading: applyingCoupon }] = useApplyCouponMutation()
  const [removeCoupon] = useRemoveCouponMutation()

  const cart = data?.cart || { items: [], coupon: null, couponDiscount: 0 }
  // Filter out any invalid items or items with deleted products to prevent crashes
  const items = (cart.items || []).filter(item => item && item.product)
  
  const subtotal = items.reduce((s, i) => s + (i.price ?? i.product?.price ?? 0) * (i.quantity ?? 1), 0)
  const couponDiscount = cart.couponDiscount || 0
  const shipping = subtotal - couponDiscount >= 499 || subtotal === 0 ? 0 : 49
  const total = Math.max(0, subtotal - couponDiscount) + shipping

  const handleQty = async (itemId, qty) => {
    if (qty < 1) return
    try { await updateItem({ itemId, quantity: qty }).unwrap() }
    catch (e) { toast.error('Failed to update quantity') }
  }

  const handleRemove = async (itemId) => {
    try { await removeItem(itemId).unwrap(); toast.success('Item removed') }
    catch { toast.error('Failed to remove item') }
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    try {
      await applyCoupon({ code: couponInput.trim().toUpperCase() }).unwrap()
      toast.success('🎉 Coupon applied!')
      setCouponInput('')
    } catch (e) { toast.error(e?.data?.message || 'Invalid coupon') }
  }

  const handleRemoveCoupon = async () => {
    try { await removeCoupon().unwrap(); toast.success('Coupon removed') }
    catch { toast.error('Failed to remove coupon') }
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-950">
      <div>
        <HiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Please login to view cart</h2>
        <Link to="/login" className="btn-primary mt-4 inline-block">Login / Sign Up</Link>
      </div>
    </div>
  )

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="xl" /></div>

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
        <div>
          <HiShoppingCart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load cart</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">There was an error loading your shopping cart. Please try again.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Reload Page</button>
        </div>
      </div>
    )
  }

  if (items.length === 0) return (
    <>
      <Helmet><title>Cart - ShopEase</title></Helmet>
      <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
        <div>
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add some amazing products to get started</p>
          <Link to="/products" className="btn-primary btn-lg inline-block">Start Shopping</Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Helmet><title>My Cart ({items.length} items) - ShopEase</title></Helmet>
      <div className="container-custom py-8">
        <div className="flex items-center gap-3 mb-6">
          <HiShoppingCart className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
            My Cart <span className="text-gray-400 font-normal text-lg">({items.length} items)</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <motion.div key={item._id} layout
                className="card p-4 flex gap-4 items-start">
                <Link to={item.product?.slug ? `/products/${item.product.slug}` : '#'} className="shrink-0">
                  <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                    alt={item.product?.name || 'Product'} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link to={item.product?.slug ? `/products/${item.product.slug}` : '#'}
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-2 text-sm">
                      {item.product?.name || 'Unnamed Product'}
                    </Link>
                    <button onClick={() => handleRemove(item._id)} className="text-gray-400 hover:text-red-500 shrink-0">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                  {item.variant?.value && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button onClick={() => handleQty(item._id, item.quantity - 1)} disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
                        <HiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQty(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
                        <HiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{fmt((item.price ?? item.product?.price ?? 0) * item.quantity)}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            <button onClick={() => clearCart()} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mt-2">
              <HiTrash className="w-4 h-4" /> Clear Cart
            </button>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-4">
                {cart.coupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <HiTag className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        {cart.coupon && typeof cart.coupon === 'object' ? cart.coupon?.code : (typeof cart.coupon === 'string' ? cart.coupon : '')}
                      </span>
                      <span className="text-green-600">applied</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                      <HiXMark className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setShowCoupon(!showCoupon)}
                      className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline">
                      <HiTag className="w-4 h-4" /> Have a coupon code?
                    </button>
                    {showCoupon && (
                      <div className="flex gap-2 mt-2">
                        <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter code" className="input text-sm py-2 uppercase" />
                        <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="btn-primary btn-sm shrink-0">
                          {applyingCoupon ? <LoadingSpinner size="xs" color="white" /> : 'Apply'}
                        </button>
                      </div>
                    )}
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {['WELCOME10', 'FLAT200', 'SUMMER25'].map(c => (
                        <button key={c} onClick={() => { setCouponInput(c); setShowCoupon(true) }}
                          className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({items.length} items)</span><span>{fmt(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-{fmt(couponDiscount)}</span></div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
                </div>
                {subtotal < 499 && subtotal > 0 && (
                  <p className="text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-lg px-3 py-2">
                    Add {fmt(499 - subtotal)} more for free delivery!
                  </p>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <HiCheckCircle className="w-3.5 h-3.5" /> You're saving {fmt(couponDiscount)}!
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center py-3 mt-5 text-base">
                Proceed to Checkout <HiArrowRight className="w-5 h-5" />
              </button>
              <Link to="/products" className="btn-ghost w-full justify-center text-sm mt-2">Continue Shopping</Link>
            </div>

            {/* Trust */}
            <div className="card p-4 space-y-2 text-sm">
              {[HiShieldCheck, HiTruck, HiCheckCircle].map((Icon, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Icon className="w-4 h-4 text-primary-600 shrink-0" />
                  {i === 0 && 'Secure & encrypted checkout'}
                  {i === 1 && 'Fast & reliable delivery'}
                  {i === 2 && '100% authentic products'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CartPage
