import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin, setCredentials } from './store/slices/authSlice'
import { setCart } from './store/slices/cartSlice'
import { setWishlist } from './store/slices/wishlistSlice'
import { useGetCartQuery } from './services/api'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Layout components
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'
import AuthLayout from './components/layout/AuthLayout'

// Customer Pages (lazy loaded)
const HomePage = lazy(() => import('./pages/customer/HomePage'))
const ProductsPage = lazy(() => import('./pages/customer/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/customer/CartPage'))
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'))
const OrderTrackingPage = lazy(() => import('./pages/customer/OrderTrackingPage'))
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'))
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'))
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'))
const AboutPage = lazy(() => import('./pages/customer/AboutPage'))
const ContactPage = lazy(() => import('./pages/customer/ContactPage'))
const FAQPage = lazy(() => import('./pages/customer/FAQPage'))
const TermsPage = lazy(() => import('./pages/customer/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/customer/PrivacyPage'))
const ReturnPolicyPage = lazy(() => import('./pages/customer/ReturnPolicyPage'))
const PaymentSuccessPage = lazy(() => import('./pages/customer/PaymentSuccessPage'))

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const OTPVerificationPage = lazy(() => import('./pages/auth/OTPVerificationPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetailPage'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminCustomerDetail = lazy(() => import('./pages/admin/AdminCustomerDetailPage'))
const AdminInventory = lazy(() => import('./pages/admin/AdminInventoryPage'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCouponsPage'))
const AdminReports = lazy(() => import('./pages/admin/AdminReportsPage'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotificationsPage'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettingsPage'))

// Route guards
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/'} replace />
  return children
}

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <LoadingSpinner size="lg" />
  </div>
)

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated })

  // Sync cart when authenticated
  useEffect(() => {
    if (cartData?.cart) {
      dispatch(setCart(cartData.cart))
    }
  }, [cartData, dispatch])

  // Sync user wishlist
  const user = useSelector((state) => state.auth.user)
  useEffect(() => {
    if (user?.wishlist) {
      dispatch(setWishlist(user.wishlist))
    }
  }, [user, dispatch])

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/payment-success" element={<PrivateRoute><PaymentSuccessPage /></PrivateRoute>} />
          <Route path="/orders/:id/track" element={<PrivateRoute><OrderTrackingPage /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
