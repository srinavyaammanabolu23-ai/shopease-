import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser, HiOutlineBell,
  HiOutlineSearch, HiOutlineMenu, HiOutlineX, HiSun, HiMoon,
  HiOutlineChevronDown, HiOutlineLogout, HiOutlineCog,
  HiShoppingBag, HiOutlineHome
} from 'react-icons/hi'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { selectIsAuthenticated, selectIsAdmin, selectCurrentUser, logout } from '../../store/slices/authSlice'
import { selectCartCount } from '../../store/slices/cartSlice'
import { selectDarkMode, toggleDarkMode, setCartDrawerOpen, setSearchOpen, setMobileMenuOpen } from '../../store/slices/uiSlice'
import { useGetCategoriesQuery, useLogoutMutation } from '../../services/api'
import { clearCart } from '../../store/slices/cartSlice'
import { clearWishlist } from '../../store/slices/wishlistSlice'
import toast from 'react-hot-toast'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileOpen] = useState(false)
  const userMenuRef = useRef(null)

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const user = useSelector(selectCurrentUser)
  const cartCount = useSelector(selectCartCount)
  const darkMode = useSelector(selectDarkMode)

  const { data: categoriesData } = useGetCategoriesQuery({ flat: true })
  const [logoutMutation] = useLogoutMutation()

  // Track scroll for shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false)
    setCategoryMenuOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutMutation()
      dispatch(logout())
      dispatch(clearCart())
      dispatch(clearWishlist())
      toast.success('Logged out successfully')
      navigate('/')
    } catch {
      dispatch(logout())
      navigate('/')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const categories = categoriesData?.categories?.slice(0, 8) || []

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 text-white text-center py-1.5 text-xs font-medium">
        🎉 Free shipping on orders above ₹499! Use code <span className="font-bold underline">WELCOME10</span> for 10% off
      </div>

      {/* Main navbar */}
      <div className="glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container-custom">
          <div className="flex items-center h-16 gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileMenuOpen)}
              className="lg:hidden btn-ghost btn-icon"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <HiShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-display gradient-text hidden sm:block">ShopEase</span>
            </Link>

            {/* Category dropdown - desktop */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                className="flex items-center gap-1 btn-ghost text-sm font-medium"
              >
                Categories <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {categoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 w-56 card py-2 z-50"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <span className="text-lg">{cat.icon || '📦'}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                      </Link>
                    ))}
                    <div className="divider mx-4 my-2" />
                    <Link
                      to="/products"
                      className="flex items-center gap-3 px-4 py-2.5 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      View All Products →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search bar - desktop */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
              <div className="relative w-full">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="input pl-10 pr-4 h-10 text-sm"
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary btn-sm py-1 px-3"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile search */}
              <button
                onClick={() => dispatch(setSearchOpen(true))}
                className="btn-ghost btn-icon md:hidden"
                aria-label="Search"
              >
                <HiMagnifyingGlass className="w-5 h-5" />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className="btn-ghost btn-icon"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/wishlist" className="btn-ghost btn-icon relative" aria-label="Wishlist">
                  <HiOutlineHeart className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => dispatch(setCartDrawerOpen(true))}
                className="btn-ghost btn-icon relative"
                aria-label="Cart"
                id="cart-btn"
              >
                <HiOutlineShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 btn-ghost py-1.5 px-2"
                    aria-label="User menu"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <HiOutlineChevronDown className={`w-3.5 h-3.5 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-56 card py-2 z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          {isAdmin && <span className="badge badge-primary mt-1">Admin</span>}
                        </div>

                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium transition-colors">
                            <HiOutlineCog className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}

                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <HiOutlineUser className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <HiShoppingBag className="w-4 h-4" /> My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <HiOutlineHeart className="w-4 h-4" /> Wishlist
                        </Link>

                        <div className="divider mx-4 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                        >
                          <HiOutlineLogout className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm font-medium hidden sm:flex">Login</Link>
                  <Link to="/register" className="btn-primary btn-sm hidden sm:flex">Sign Up</Link>
                  <Link to="/login" className="btn-ghost btn-icon sm:hidden">
                    <HiOutlineUser className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="container-custom py-4">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="input pl-10"
                  />
                </div>
              </form>

              {/* Mobile nav links */}
              <nav className="space-y-1">
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                  <HiOutlineHome className="w-4 h-4" /> Home
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span>{cat.icon || '📦'}</span> {cat.name}
                  </Link>
                ))}
              </nav>

              {!isAuthenticated && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link to="/login" className="btn-secondary flex-1 justify-center">Login</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
