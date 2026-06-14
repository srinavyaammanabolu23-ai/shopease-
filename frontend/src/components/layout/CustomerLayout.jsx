import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import CartDrawer from '../common/CartDrawer'
import SearchModal from '../common/SearchModal'
import { useSelector } from 'react-redux'
import { selectCartDrawerOpen, selectDarkMode } from '../../store/slices/uiSlice'

const CustomerLayout = () => {
  const cartDrawerOpen = useSelector(selectCartDrawerOpen)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </div>
  )
}

export default CustomerLayout
