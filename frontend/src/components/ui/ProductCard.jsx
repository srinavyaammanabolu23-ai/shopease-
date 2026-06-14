import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHeart, HiShoppingCart, HiEye } from 'react-icons/hi2'
import { HiOutlineHeart } from 'react-icons/hi'
import { useDispatch, useSelector } from 'react-redux'
import { useAddToCartMutation, useToggleWishlistMutation } from '../../services/api'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { selectIsWishlisted, toggleWishlistItem } from '../../store/slices/wishlistSlice'
import { incrementCartCount } from '../../store/slices/cartSlice'
import StarRating from './StarRating'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const formatPrice = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const ProductCard = ({ product, className = '' }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation()
  const [toggleWishlist] = useToggleWishlistMutation()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isWishlisted = useSelector(selectIsWishlisted(product?._id))

  if (!product) return null

  const effectivePrice = product.price - (product.price * (product.discount || 0)) / 100
  const inStock = product.stock > 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    if (!inStock) return
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap()
      dispatch(incrementCartCount(1))
      toast.success('Added to cart! 🛒')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add to cart')
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to save items')
      navigate('/login')
      return
    }
    try {
      dispatch(toggleWishlistItem(product._id))
      await toggleWishlist(product._id).unwrap()
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️')
    } catch {
      dispatch(toggleWishlistItem(product._id)) // revert optimistic
      toast.error('Failed to update wishlist')
    }
  }

  const imgSrc = (!imgError && product.images?.[0]?.url)
    ? product.images[0].url
    : `https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=${encodeURIComponent(product.name?.charAt(0) || 'P')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group card overflow-hidden flex flex-col cursor-pointer ${className}`}
    >
      <Link to={`/products/${product.slug}`} className="flex flex-col flex-1">
        {/* Image container */}
        <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!inStock ? 'opacity-60' : ''}`}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount > 0 && (
              <span className="badge bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                -{product.discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="badge bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5">NEW</span>
            )}
            {product.isBestSeller && (
              <span className="badge bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">BEST</span>
            )}
          </div>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="badge bg-gray-800 text-white font-semibold">Out of Stock</span>
            </div>
          )}

          {/* Action buttons on hover */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              aria-label="Quick view"
            >
              <HiEye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product info */}
        <div className="p-3 flex flex-col flex-1 gap-1.5">
          {product.brand && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>

          {/* Ratings */}
          {product.ratings?.count > 0 && (
            <StarRating
              rating={product.ratings.average}
              count={product.ratings.count}
              size="sm"
            />
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatPrice(effectivePrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock status */}
          {isLowStock && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Only {product.stock} left!
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            !inStock
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md active:scale-95'
          }`}
          aria-label={inStock ? 'Add to cart' : 'Out of stock'}
        >
          {addingToCart ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <>
              <HiShoppingCart className="w-4 h-4" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default ProductCard
