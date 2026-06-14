import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  HiPlus, HiMinus, HiHeart, HiShoppingCart,
  HiBolt, HiShare, HiShieldCheck, HiTruck, HiArrowPath,
  HiCheckCircle, HiStar, HiChevronLeft, HiChevronRight
} from 'react-icons/hi2'
import { HiOutlineHeart } from 'react-icons/hi'
import { useDispatch, useSelector } from 'react-redux'
import {
  useGetProductQuery, useGetProductReviewsQuery,
  useAddToCartMutation, useToggleWishlistMutation, useCreateReviewMutation
} from '../../services/api'
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice'
import { selectIsWishlisted, toggleWishlistItem } from '../../store/slices/wishlistSlice'
import { addRecentlyViewed, setCartDrawerOpen } from '../../store/slices/uiSlice'
import { incrementCartCount } from '../../store/slices/cartSlice'
import StarRating from '../../components/ui/StarRating'
import ProductCard from '../../components/ui/ProductCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const formatPrice = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [activeImg, setActiveImg] = useState(0)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const isWishlisted = useSelector(selectIsWishlisted(slug))

  const { data, isLoading, error } = useGetProductQuery(slug)
  const { data: reviewsData } = useGetProductReviewsQuery({ productId: data?.product?._id }, { skip: !data?.product?._id })
  const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation()
  const [toggleWishlistMut] = useToggleWishlistMutation()
  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation()

  const product = data?.product
  const related = data?.related || []
  const reviews = reviewsData?.reviews || []

  // Track recently viewed
  useEffect(() => {
    if (product) dispatch(addRecentlyViewed(product))
  }, [product, dispatch])

  const handleAddToCart = async (goCheckout = false) => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!product?.stock) return
    try {
      await addToCart({ productId: product._id, quantity: qty }).unwrap()
      dispatch(incrementCartCount(qty))
      if (goCheckout) {
        navigate('/checkout')
      } else {
        dispatch(setCartDrawerOpen(true))
        toast.success(`${qty > 1 ? `${qty}x ` : ''}Added to cart! 🛒`)
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add to cart')
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    dispatch(toggleWishlistItem(product._id))
    try {
      await toggleWishlistMut(product._id).unwrap()
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️')
    } catch {
      dispatch(toggleWishlistItem(product._id))
    }
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) { toast.error('Please write a review'); return }
    try {
      await createReview({ productId: product._id, ...reviewForm }).unwrap()
      toast.success('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewForm({ rating: 5, title: '', comment: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit review')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" />
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <div>
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h2>
        <Link to="/products" className="btn-primary mt-4">Browse Products</Link>
      </div>
    </div>
  )

  const effectivePrice = product.price - (product.price * (product.discount || 0)) / 100
  const inStock = product.stock > 0
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/600', alt: product.name }]

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rv => Math.round(rv.rating) === r).length,
    pct: reviews.length ? Math.round((reviews.filter(rv => Math.round(rv.rating) === r).length / reviews.length) * 100) : 0,
  }))

  return (
    <>
      <Helmet>
        <title>{product.name} - ShopEase</title>
        <meta name="description" content={product.shortDescription || product.description?.slice(0, 155)} />
      </Helmet>

      <div className="container-custom py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-600">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* ===== LEFT: Image Gallery ===== */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  src={images[activeImg]?.url}
                  alt={images[activeImg]?.alt || product.name}
                  className={`w-full h-full object-contain p-4 ${!inStock ? 'opacity-60' : ''}`}
                />
              </AnimatePresence>

              {/* Badges */}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}% OFF
                </div>
              )}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="bg-gray-900 text-white px-6 py-2 rounded-full font-semibold">Out of Stock</span>
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 dark:border-gray-700'}`}>
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT: Product Info ===== */}
          <div className="space-y-5">
            {product.brand && (
              <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.ratings?.average || 0} count={product.ratings?.count} size="md" />
              <button onClick={() => setActiveTab('reviews')}
                className="text-sm text-primary-600 hover:underline">
                Read all reviews
              </button>
            </div>

            {/* Price block */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(effectivePrice)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-gray-400 line-through">{formatPrice(product.price)}</span>
                    <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.discount > 0 && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                  You save {formatPrice(product.price - effectivePrice)}!
                </p>
              )}
              <div className="mt-2">
                {inStock ? (
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <HiCheckCircle className="w-4 h-4" />
                    In Stock {product.stock <= 10 && `(Only ${product.stock} left!)`}
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-semibold">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Quantity selector */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} available</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button onClick={() => handleAddToCart(false)} disabled={!inStock || addingToCart}
                  className="flex-1 btn-primary py-3 justify-center text-base">
                  {addingToCart ? <LoadingSpinner size="sm" color="white" /> : <><HiShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
                <button onClick={handleWishlist}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-300 dark:border-gray-700 text-gray-500 hover:border-red-300 hover:text-red-500'}`}>
                  {isWishlisted ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                </button>
              </div>
              {inStock && (
                <button onClick={() => handleAddToCart(true)} disabled={addingToCart}
                  className="btn-accent py-3 justify-center text-base w-full">
                  <HiBolt className="w-5 h-5" /> Buy Now
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: HiTruck, text: 'Free Delivery', sub: 'On orders above ₹499' },
                { icon: HiArrowPath, text: '30-Day Returns', sub: 'Easy hassle-free returns' },
                { icon: HiShieldCheck, text: 'Secure Payment', sub: '100% safe & secure' },
                { icon: HiCheckCircle, text: '100% Authentic', sub: 'Genuine products only' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{text}</p>
                    <p className="text-[10px] text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Share */}
            <button onClick={handleShareLink}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <HiShare className="w-4 h-4" /> Share this product
            </button>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="card mb-10">
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                {product.specifications?.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                          <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-1/3">{spec.key}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                    {/* Rating summary */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-5xl font-black text-gray-900 dark:text-white">{(product.ratings?.average || 0).toFixed(1)}</p>
                        <StarRating rating={product.ratings?.average || 0} size="md" />
                        <p className="text-sm text-gray-500 mt-1">{product.ratings?.count} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingBreakdown.map(({ star, count, pct }) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-3">{star}</span>
                            <HiStar className="w-3 h-3 text-amber-400" />
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Write review button */}
                    <div className="flex items-center justify-center">
                      {isAuthenticated && (
                        <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary">
                          <HiStar className="w-4 h-4" /> Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Review form */}
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-6 space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Your Review</h3>
                      <div>
                        <label className="label">Rating</label>
                        <StarRating rating={reviewForm.rating} size="lg" interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                      </div>
                      <div>
                        <label className="label">Title</label>
                        <input type="text" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          className="input" placeholder="Summarize your experience" />
                      </div>
                      <div>
                        <label className="label">Review</label>
                        <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                          className="input resize-none h-28" placeholder="Share your detailed experience..." required />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" disabled={submittingReview} className="btn-primary">
                          {submittingReview ? <LoadingSpinner size="sm" color="white" /> : 'Submit Review'}
                        </button>
                        <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Review list */}
                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                    {isAuthenticated && (
                      <button onClick={() => setShowReviewForm(true)} className="btn-primary">Write a Review</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(review => (
                      <div key={review._id} className="border-b border-gray-100 dark:border-gray-800 pb-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{review.user?.name || 'Customer'}</p>
                              <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        {review.title && <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{review.title}</h4>}
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
                            <HiCheckCircle className="w-3.5 h-3.5" /> Verified Purchase
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {related.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default ProductDetailPage
