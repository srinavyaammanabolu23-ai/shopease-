import { useSelector, useDispatch } from 'react-redux'
import { HiBars3, HiBell, HiMoon, HiSun, HiUser, HiArrowRightOnRectangle } from 'react-icons/hi2'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { setCredentials } from '../../store/slices/authSlice'
import { selectDarkMode, toggleDarkMode } from '../../store/slices/uiSlice'
import { useLogoutMutation } from '../../services/api'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/coupons': 'Coupons',
  '/admin/reviews': 'Reviews',
  '/admin/reports': 'Reports & Analytics',
  '/admin/settings': 'Settings',
  '/admin/inventory': 'Inventory',
}

const AdminTopbar = ({ onMenuClick }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const darkMode = useSelector(selectDarkMode)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logout] = useLogoutMutation()

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin'

  const handleLogout = async () => {
    try { await logout().unwrap() } catch {}
    dispatch(setCredentials({ user: null, accessToken: null }))
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost btn-icon">
          <HiBars3 className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white text-base">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button onClick={() => dispatch(toggleDarkMode())} className="btn-ghost btn-icon" aria-label="Toggle dark mode">
          {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="btn-ghost btn-icon relative" aria-label="Notifications">
          <HiBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{user?.name?.split(' ')[0]}</span>
          </button>

          {dropdownOpen && (
            <>
              <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10" />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-20 py-1">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button onClick={() => { navigate('/admin/settings'); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <HiUser className="w-4 h-4" /> Profile
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <HiArrowRightOnRectangle className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminTopbar
