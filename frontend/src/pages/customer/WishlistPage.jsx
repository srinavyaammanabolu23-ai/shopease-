import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { HiHeart, HiTrash, HiShoppingCart, HiArrowRight } from 'react-icons/hi2'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetWishlistQuery, useToggleWishlistMutation, useAddToCartMutation } from '../../services/api'
import { toggleWishlistItem } from '../../store/slices/wishlistSlice'
import { incrementCartCount } from '../../store/slices/cartSlice'
import SkeletonCard from '../../components/ui/SkeletonCard'
import toast from 'react-hot-toast'

const fmt = n => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

const WishlistPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useGetWishlistQuery()
  const [toggleWishlist] = useToggleWishlistMutation()
  const [addToCart, { isLoading: adding }] = useAddToCartMutation()

  const items = data?.wishlist?.items || data?.items || []

  const handleRemove = async (productId) => {
    dispatch(toggleWishlistItem(productId))
    try {
      await toggleWishlist(productId).unwrap()
      refetch()
      toast.success('Removed from wishlist')
    } catch {
      dispatch(toggleWishlistItem(productId))
      toast.error('Failed to remove')
    }
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap()
      dispatch(incrementCartCount(1))
      toast.success('Added to cart! 🛒')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add to cart')
    }
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist - ShopEase</title>
        <meta name="description" content="Your saved products on ShopEase" />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <HiHeart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">My Wishlist</h1>
              {items.length > 0 && <p className="text-sm text-gray-500">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>}
            </div>
          </div>
          {items.length > 0 && (
            <Link to="/products" className="btn-secondary btn-sm">
              Continue Shopping <HiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 card max-w-md mx-auto">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiHeart className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you love and come back to them anytime.</p>
            <Link to="/products" className="btn-primary">
              <HiShoppingCart className="w-4 h-4" /> Start Browsing
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {items.map((item, i) => {
                const product = item.product || item
                if (!product?._id) return null
                const effectivePrice = product.price - (product.price * (product.discount || 0)) / 100
                const inStock = product.stock > 0

                return (
                  <motion.div key={product._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
                    className="card overflow-hidden group hover:-translate-y-1 transition-all duration-200">
                    {/* Image */}
                    <Link to={`/products/${product.slug}`} className="block relative">
                      <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden">
                        <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300'} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      {product.discount > 0 && (
                        <span className="absolute top-2 left-2 badge bg-red-500 text-white text-[10px] font-bold">-{product.discount}%</span>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="badge bg-gray-800 text-white">Out of Stock</span>
                        </div>
                      )}
                    </Link>
                    {/* Info */}
                    <div className="p-3">
                      {product.brand && <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{product.brand}</p>}
                      <Link to={`/products/${product.slug}`}>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mt-0.5 hover:text-primary-600 transition-colors">{product.name}</h3>
                      </Link>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="font-bold text-gray-900 dark:text-white">{fmt(effectivePrice)}</span>
                        {product.discount > 0 && <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleAddToCart(product)} disabled={!inStock || adding}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${inStock ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                          <HiShoppingCart className="w-3.5 h-3.5" />
                          {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button onClick={() => handleRemove(product._id)}
                          className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
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

export default WishlistPage
