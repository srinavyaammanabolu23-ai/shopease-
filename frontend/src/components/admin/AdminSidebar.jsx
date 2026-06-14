import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPresentationChartLine, HiShoppingBag, HiTag, HiClipboardDocument,
  HiUsers, HiChartBar, HiCog, HiArrowRightOnRectangle,
  HiBell, HiReceiptPercent, HiCube, HiStar, HiChevronLeft,
  HiChevronRight, HiArrowTopRightOnSquare, HiXMark
} from 'react-icons/hi2'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { setCredentials } from '../../store/slices/authSlice'
import { useLogoutMutation } from '../../services/api'
import toast from 'react-hot-toast'

const navItems = [
  { section: 'Main', items: [
    { to: '/admin', label: 'Dashboard', icon: HiPresentationChartLine },
    { to: '/admin/notifications', label: 'Notifications', icon: HiBell, badge: 0 },
  ]},
  { section: 'Catalog', items: [
    { to: '/admin/products', label: 'Products', icon: HiShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: HiTag },
    { to: '/admin/inventory', label: 'Inventory', icon: HiCube },
  ]},
  { section: 'Sales', items: [
    { to: '/admin/orders', label: 'Orders', icon: HiClipboardDocument },
    { to: '/admin/coupons', label: 'Coupons', icon: HiReceiptPercent },
    { to: '/admin/reviews', label: 'Reviews', icon: HiStar },
  ]},
  { section: 'People', items: [
    { to: '/admin/customers', label: 'Customers', icon: HiUsers },
  ]},
  { section: 'Analytics', items: [
    { to: '/admin/reports', label: 'Reports', icon: HiChartBar },
  ]},
  { section: 'System', items: [
    { to: '/admin/settings', label: 'Settings', icon: HiCog },
  ]},
]

const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [logout] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {}
    dispatch(setCredentials({ user: null, accessToken: null }))
    navigate('/')
    toast.success('Logged out')
  }

  const isActive = (to) => location.pathname === to

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-5'} py-4 border-b border-gray-800`}>
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <HiShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-black font-display text-white">ShopEase</span>
          </Link>
        )}
        <button onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 transition-colors hidden lg:flex">
          {collapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
        </button>
        {mobileOpen !== undefined && (
          <button onClick={onMobileClose} className="lg:hidden text-gray-400">
            <HiXMark className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {navItems.map(section => (
          <div key={section.section} className="mb-2">
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5">{section.section}</p>
            )}
            {section.items.map(item => {
              const Icon = item.icon
              const active = isActive(item.to)
              return (
                <Link key={item.to} to={item.to}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                    active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}>
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        <Link to="/" target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <HiArrowTopRightOnSquare className="w-4 h-4 shrink-0" />
          {!collapsed && 'Visit Store'}
        </Link>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <HiArrowRightOnRectangle className="w-4 h-4 shrink-0" />
          {!collapsed && 'Logout'}
        </button>
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gray-950 border-r border-gray-800 fixed left-0 top-0 h-full z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed left-0 top-0 h-full w-64 bg-gray-950 z-50 lg:hidden flex flex-col">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminSidebar
