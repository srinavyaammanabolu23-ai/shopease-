import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { HiXMark, HiPlus, HiMinus, HiTrash, HiShoppingCart, HiArrowRight } from 'react-icons/hi2'
import { setCartDrawerOpen, selectCartDrawerOpen } from '../../store/slices/uiSlice'
import {
  useGetCartQuery, useUpdateCartItemMutation,
  useRemoveFromCartMutation, useClearCartMutation
} from '../../services/api'
import { setCart } from '../../store/slices/cartSlice'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CartDrawer = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isOpen = useSelector(selectCartDrawerOpen)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const { data, isLoading } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const [updateItem] = useUpdateCartItemMutation()
  const [removeItem] = useRemoveFromCartMutation()
  const [clearCart] = useClearCartMutation()

  const cart = data?.cart || { items: [], subtotal: 0, itemsCount: 0, couponDiscount: 0 }
  const items = cart.items || []

  const subtotal = items.reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity, 0)
  const shippingCharge = subtotal >= 499 ? 0 : (subtotal > 0 ? 49 : 0)
  const total = subtotal + shippingCharge - (cart.couponDiscount || 0)

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return
    try {
      await updateItem({ itemId, quantity: newQty }).unwrap()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update quantity')
    }
  }

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId).unwrap()
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const handleCheckout = () => {
    dispatch(setCartDrawerOpen(false))
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout')
    } else {
      navigate('/checkout')
    }
  }

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setCartDrawerOpen(false))}
            className="fixed inset-0 bg-black/50 z-50"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <HiShoppingCart className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                  My Cart {items.length > 0 && <span className="text-primary-600">({items.length})</span>}
                </h2>
              </div>
              <button
                onClick={() => dispatch(setCartDrawerOpen(false))}
                className="btn-ghost btn-icon"
                aria-label="Close cart"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <HiShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Please login to view cart</h3>
                  <Link
                    to="/login"
                    onClick={() => dispatch(setCartDrawerOpen(false))}
                    className="btn-primary"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <LoadingSpinner size="lg" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <HiShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add some products to get started</p>
                  </div>
                  <Link
                    to="/products"
                    onClick={() => dispatch(setCartDrawerOpen(false))}
                    className="btn-primary"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-4"
                    >
                      {/* Product Image */}
                      <Link
                        to={`/products/${item.product?.slug}`}
                        onClick={() => dispatch(setCartDrawerOpen(false))}
                        className="shrink-0"
                      >
                        <img
                          src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                          alt={item.product?.name || item.name}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        />
                      </Link>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product?.slug}`}
                          onClick={() => dispatch(setCartDrawerOpen(false))}
                          className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {item.product?.name || item.name}
                        </Link>
                        {item.variant?.value && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <HiMinus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <HiPlus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with totals */}
            {isAuthenticated && items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-4">
                {/* Free shipping progress */}
                {subtotal < 499 && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                    <p className="text-xs text-primary-700 dark:text-primary-300 mb-1.5">
                      Add <strong>{formatPrice(499 - subtotal)}</strong> more for FREE delivery!
                    </p>
                    <div className="h-1.5 bg-primary-200 dark:bg-primary-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {cart.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(cart.couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span className={shippingCharge === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800 text-base">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button onClick={handleCheckout} className="btn-primary w-full justify-center">
                    Proceed to Checkout <HiArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/cart"
                    onClick={() => dispatch(setCartDrawerOpen(false))}
                    className="btn-secondary w-full justify-center text-center"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CartDrawer
