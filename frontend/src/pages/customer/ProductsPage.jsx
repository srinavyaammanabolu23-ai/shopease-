import { useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  HiAdjustmentsHorizontal, HiXMark, HiBars3, HiSquares2X2,
  HiChevronDown, HiChevronUp, HiFunnel, HiShoppingCart,
  HiMagnifyingGlass, HiArrowRight
} from 'react-icons/hi2'
import { HiStar, HiOutlineHeart } from 'react-icons/hi'
import { useDispatch, useSelector } from 'react-redux'
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery, useAddToCartMutation, useToggleWishlistMutation } from '../../services/api'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { selectIsWishlisted, toggleWishlistItem } from '../../store/slices/wishlistSlice'
import { incrementCartCount } from '../../store/slices/cartSlice'
import ProductCard from '../../components/ui/ProductCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import Pagination from '../../components/ui/Pagination'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'ratings.average_desc', label: 'Top Rated' },
  { value: 'sold_desc', label: 'Best Selling' },
  { value: 'discount_desc', label: 'Biggest Discount' },
]

const PRICE_PRESETS = [
  { label: 'Under ₹500', min: '0', max: '500' },
  { label: '₹500–₹2K', min: '500', max: '2000' },
  { label: '₹2K–₹10K', min: '2000', max: '10000' },
  { label: 'Above ₹10K', min: '10000', max: '' },
]

/* Collapsible filter section */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        {title}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Horizontal list-view product card */
const ListProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [addToCart, { isLoading: adding }] = useAddToCartMutation()
  const [toggleWishlist] = useToggleWishlistMutation()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isWishlisted = useSelector(selectIsWishlisted(product?._id))

  if (!product) return null
  const effectivePrice = product.price - (product.price * (product.discount || 0)) / 100
  const inStock = product.stock > 0

  const handleCart = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login'); navigate('/login'); return }
    if (!inStock) return
    try { await addToCart({ productId: product._id, quantity: 1 }).unwrap(); dispatch(incrementCartCount(1)); toast.success('Added to cart! 🛒') }
    catch (err) { toast.error(err?.data?.message || 'Failed') }
  }

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login'); return }
    dispatch(toggleWishlistItem(product._id))
    try { await toggleWishlist(product._id).unwrap() }
    catch { dispatch(toggleWishlistItem(product._id)) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="card flex gap-4 p-4 group hover:-translate-y-0.5 transition-all duration-200">
      <Link to={`/products/${product.slug}`} className="shrink-0">
        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
          <img src={product.images?.[0]?.url || `https://via.placeholder.com/144`} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {product.brand && <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{product.brand}</p>}
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 mt-0.5">{product.name}</h3>
          </Link>
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">{[...Array(5)].map((_, i) => <HiStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.ratings.average) ? 'text-amber-400' : 'text-gray-300'}`} />)}</div>
              <span className="text-xs text-gray-500">({product.ratings.count})</span>
            </div>
          )}
          {product.shortDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 hidden sm:block">{product.shortDescription}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{Math.round(effectivePrice).toLocaleString('en-IN')}</span>
            {product.discount > 0 && <>
              <span className="text-xs text-gray-400 line-through">₹{Math.round(product.price).toLocaleString('en-IN')}</span>
              <span className="badge bg-green-100 text-green-700 text-[10px] font-bold">{product.discount}% off</span>
            </>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${isWishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-400 hover:text-red-500'}`}>
              <HiOutlineHeart className="w-4 h-4" />
            </button>
            <button onClick={handleCart} disabled={!inStock || adding}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${inStock ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
              <HiShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [localMin, setLocalMin] = useState('')
  const [localMax, setLocalMax] = useState('')

  const currentCategory = searchParams.get('category') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentRating = searchParams.get('minRating') || ''
  const currentInStock = searchParams.get('inStock') === 'true'
  const currentSort = searchParams.get('sort') || 'createdAt_desc'
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentSearch = searchParams.get('search') || ''
  const isFeatured = searchParams.get('isFeatured') || ''
  const isNewArrival = searchParams.get('isNewArrival') || ''
  const isBestSeller = searchParams.get('isBestSeller') || ''

  const queryParams = {
    page: currentPage, limit: 12, status: 'active',
    ...(currentCategory && { category: currentCategory }),
    ...(currentBrand && { brand: currentBrand }),
    ...(currentMinPrice && { minPrice: currentMinPrice }),
    ...(currentMaxPrice && { maxPrice: currentMaxPrice }),
    ...(currentRating && { minRating: currentRating }),
    ...(currentInStock && { inStock: true }),
    ...(currentSearch && { search: currentSearch }),
    ...(isFeatured && { isFeatured: true }),
    ...(isNewArrival && { isNewArrival: true }),
    ...(isBestSeller && { isBestSeller: true }),
    sort: currentSort.split('_')[0],
    sortOrder: currentSort.split('_')[1] === 'desc' ? -1 : 1,
  }

  const { data, isLoading, isFetching } = useGetProductsQuery(queryParams)
  const { data: catData } = useGetCategoriesQuery({ flat: true })
  const { data: brandsData } = useGetBrandsQuery()

  const products = data?.products || []
  const totalProducts = data?.total || 0
  const totalPages = data?.pages || 1
  const categories = (catData?.categories || []).filter(c => !c.parent)
  const brands = brandsData?.brands || []

  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      if (value) params.set(key, value)
      else params.delete(key)
      if (key !== 'page') params.set('page', '1')
      return params
    })
  }, [setSearchParams])

  const clearAllFilters = () => setSearchParams({ sort: currentSort })

  const hasActiveFilters = currentCategory || currentBrand || currentMinPrice || currentMaxPrice || currentRating || currentInStock

  const pageTitle = currentSearch
    ? `Results for "${currentSearch}"`
    : currentCategory
      ? categories.find(c => c.slug === currentCategory)?.name || 'Products'
      : isFeatured ? 'Featured Products'
      : isNewArrival ? 'New Arrivals'
      : isBestSeller ? 'Best Sellers'
      : 'All Products'

  const applyPriceRange = () => {
    if (localMin) setParam('minPrice', localMin)
    if (localMax) setParam('maxPrice', localMax)
  }

  const FilterPanel = () => (
    <div className="space-y-0">
      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="mb-5 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">Active Filters</span>
            <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium border border-primary-200 dark:border-primary-700">
                {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => setParam('category', '')} className="hover:text-red-500"><HiXMark className="w-3 h-3" /></button>
              </span>
            )}
            {currentBrand && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium border border-primary-200 dark:border-primary-700">
                {currentBrand} <button onClick={() => setParam('brand', '')} className="hover:text-red-500"><HiXMark className="w-3 h-3" /></button>
              </span>
            )}
            {currentRating && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-700">
                {currentRating}★+ <button onClick={() => setParam('minRating', '')} className="hover:text-red-500"><HiXMark className="w-3 h-3" /></button>
              </span>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium border border-primary-200 dark:border-primary-700">
                ₹{currentMinPrice || '0'}–{currentMaxPrice ? `₹${currentMaxPrice}` : '∞'}
                <button onClick={() => { setParam('minPrice', ''); setParam('maxPrice', '') }} className="hover:text-red-500"><HiXMark className="w-3 h-3" /></button>
              </span>
            )}
            {currentInStock && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-700">
                In Stock <button onClick={() => setParam('inStock', '')} className="hover:text-red-500"><HiXMark className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group/r">
            <input type="radio" name="category" value="" checked={!currentCategory}
              onChange={() => setParam('category', '')} className="text-primary-600 w-3.5 h-3.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/r:text-primary-600 transition-colors">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer group/r">
              <input type="radio" name="category" value={cat.slug} checked={currentCategory === cat.slug}
                onChange={() => setParam('category', cat.slug)} className="text-primary-600 w-3.5 h-3.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5 group-hover/r:text-primary-600 transition-colors">
                <span className="text-base">{cat.icon}</span>{cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map(({ label, min, max }) => {
              const active = currentMinPrice === min && currentMaxPrice === max
              return (
                <button key={label} onClick={() => { setParam('minPrice', min); setParam('maxPrice', max) }}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition-all font-medium ${active
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600'}`}>
                  {label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min ₹" value={localMin} onChange={e => setLocalMin(e.target.value)}
              className="input text-xs py-2 px-2.5 min-w-0" min="0" />
            <span className="text-gray-400 shrink-0">—</span>
            <input type="number" placeholder="Max ₹" value={localMax} onChange={e => setLocalMax(e.target.value)}
              className="input text-xs py-2 px-2.5 min-w-0" min="0" />
          </div>
          <button onClick={applyPriceRange} className="btn-primary btn-sm w-full justify-center text-xs">Apply</button>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group/r">
              <input type="radio" name="rating" value={r} checked={parseInt(currentRating) === r}
                onChange={() => setParam('minRating', r.toString())} className="text-primary-600 w-3.5 h-3.5" />
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <HiStar key={i} className={`w-3.5 h-3.5 ${i < r ? 'text-amber-400' : 'text-gray-300'}`} />)}
                <span className="text-xs text-gray-500 ml-0.5">& up</span>
              </span>
            </label>
          ))}
          {currentRating && (
            <button onClick={() => setParam('minRating', '')} className="text-xs text-gray-400 hover:text-red-500 mt-1">Clear rating filter</button>
          )}
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
            {brands.map(b => (
              <label key={b} className="flex items-center gap-2.5 cursor-pointer group/b">
                <input type="checkbox" checked={currentBrand === b}
                  onChange={() => setParam('brand', currentBrand === b ? '' : b)} className="text-primary-600 w-3.5 h-3.5 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/b:text-primary-600 transition-colors">{b}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={currentInStock}
            onChange={e => setParam('inStock', e.target.checked ? 'true' : '')} className="text-primary-600 w-3.5 h-3.5 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  )

  const loading = isLoading || isFetching

  return (
    <>
      <Helmet>
        <title>{pageTitle} - ShopEase</title>
        <meta name="description" content={`Browse ${pageTitle} on ShopEase. Best prices, fast delivery, easy returns.`} />
      </Helmet>

      <div className="container-custom py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 dark:text-white font-medium">{pageTitle}</span>
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black font-display text-gray-900 dark:text-white">{pageTitle}</h1>
            {!isLoading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {totalProducts.toLocaleString()} product{totalProducts !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <button onClick={() => setFilterOpen(true)} className="lg:hidden btn-secondary gap-2">
            <HiFunnel className="w-4 h-4" />
            Filters {hasActiveFilters && <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">!</span>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="card p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <HiAdjustmentsHorizontal className="w-4 h-4 text-primary-600" />
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h2>
                {hasActiveFilters && (
                  <span className="ml-auto text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full font-semibold">Active</span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {filterOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setFilterOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 z-50 p-5 overflow-y-auto lg:hidden shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <HiAdjustmentsHorizontal className="w-5 h-5 text-primary-600" /> Filters
                    </h2>
                    <button onClick={() => setFilterOpen(false)} className="btn-ghost btn-icon"><HiXMark className="w-5 h-5" /></button>
                  </div>
                  <FilterPanel />
                  <button onClick={() => setFilterOpen(false)} className="btn-primary w-full justify-center mt-5">
                    View {totalProducts} Products <HiArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products column */}
          <div className="flex-1 min-w-0">
            {/* Sort + View toggle bar */}
            <div className="flex items-center justify-between gap-3 mb-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:block whitespace-nowrap">Sort by:</span>
                <select value={currentSort} onChange={e => setParam('sort', e.target.value)} className="select text-sm py-1.5 pl-2 pr-7">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-0.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button onClick={() => setViewMode('grid')} title="Grid view"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <HiSquares2X2 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} title="List view"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <HiBars3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Products grid / list / empty / loading */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-3'}>
                  {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center py-24 card">
                  <div className="text-7xl mb-5">🔍</div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    {currentSearch
                      ? `We couldn't find products matching "${currentSearch}". Try different keywords.`
                      : 'No products match the selected filters. Try adjusting your filters.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {hasActiveFilters && <button onClick={clearAllFilters} className="btn-primary">Clear Filters</button>}
                    <Link to="/products" className="btn-secondary">Browse All Products</Link>
                  </div>
                </motion.div>
              ) : viewMode === 'grid' ? (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p, i) => (
                    <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                  {products.map((p, i) => (
                    <motion.div key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <ListProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setParam('page', p.toString())}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductsPage
