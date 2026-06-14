import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { HiMagnifyingGlass, HiXMark, HiArrowTurnDownLeft } from 'react-icons/hi2'
import { HiClock } from 'react-icons/hi'
import { setSearchOpen } from '../../store/slices/uiSlice'
import { useSearchProductsQuery } from '../../services/api'

const RECENT_SEARCHES_KEY = 'shopease_recent_searches'

const SearchModal = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const searchOpen = useSelector((s) => s.ui.searchOpen)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Focus on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') dispatch(setSearchOpen(false))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [dispatch])

  const { data, isFetching } = useSearchProductsQuery(debouncedQuery, {
    skip: debouncedQuery.trim().length < 2,
  })

  const products = data?.products || []

  const handleSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return
    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 6)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    dispatch(setSearchOpen(false))
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  const popularCategories = [
    { name: 'Electronics', slug: 'electronics', emoji: '💻' },
    { name: 'Fashion', slug: 'fashion', emoji: '👗' },
    { name: 'Home', slug: 'home-living', emoji: '🏠' },
    { name: 'Sports', slug: 'sports', emoji: '⚽' },
    { name: 'Books', slug: 'books', emoji: '📚' },
    { name: 'Beauty', slug: 'beauty', emoji: '💄' },
  ]

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setSearchOpen(false))}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <HiMagnifyingGlass className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for products, brands, categories..."
                className="flex-1 text-base bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <HiXMark className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => dispatch(setSearchOpen(false))}
                className="btn-ghost btn-sm text-xs ml-1"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Live search results */}
              {debouncedQuery.trim().length >= 2 && (
                <div>
                  {isFetching ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-3/4 rounded" />
                            <div className="skeleton h-3 w-1/2 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : products.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Products
                      </p>
                      <div className="space-y-2">
                        {products.map((product) => (
                          <Link
                            key={product._id}
                            to={`/products/${product.slug}`}
                            onClick={() => {
                              handleSearch(query)
                              dispatch(setSearchOpen(false))
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                          >
                            <img
                              src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                ₹{Math.round(product.price - product.price * product.discount / 100).toLocaleString('en-IN')}
                              </p>
                              {product.discount > 0 && (
                                <p className="text-xs text-green-600">{product.discount}% off</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      {/* View all results */}
                      <button
                        onClick={() => handleSearch()}
                        className="w-full mt-3 py-2.5 text-sm text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl flex items-center justify-center gap-2 transition-colors border border-primary-200 dark:border-primary-800"
                      >
                        <HiArrowTurnDownLeft className="w-4 h-4" />
                        View all results for "{query}"
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No products found for "{query}"</p>
                      <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                    </div>
                  )}
                </div>
              )}

              {/* Default state: recent searches + categories */}
              {debouncedQuery.trim().length < 2 && (
                <div className="space-y-6">
                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Recent Searches
                        </p>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => { setQuery(s); handleSearch(s) }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 transition-colors"
                          >
                            <HiClock className="w-3 h-3" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular categories */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Browse Categories
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {popularCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/products?category=${cat.slug}`}
                          onClick={() => dispatch(setSearchOpen(false))}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
                        >
                          <span className="text-2xl">{cat.emoji}</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchModal
