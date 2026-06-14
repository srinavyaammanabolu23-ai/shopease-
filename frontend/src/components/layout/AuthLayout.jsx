import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { selectDarkMode, toggleDarkMode } from '../../store/slices/uiSlice'
import { useDispatch } from 'react-redux'
import { HiSun, HiMoon } from 'react-icons/hi2'

const AuthLayout = () => {
  const darkMode = useSelector(selectDarkMode)
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Theme toggle */}
      <button
        onClick={() => dispatch(toggleDarkMode())}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        aria-label="Toggle theme"
      >
        {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg font-display">S</span>
            </div>
            <span className="text-2xl font-bold font-display gradient-text">ShopEase</span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your One-Stop Shopping Destination</p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
          <Outlet />
        </motion.div>

        {/* Footer links */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms</Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy</Link>
          <span className="mx-2">·</span>
          <Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Support</Link>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
