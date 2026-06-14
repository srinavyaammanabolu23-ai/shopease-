import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { HiEye, HiEyeSlash, HiEnvelope, HiLockClosed } from 'react-icons/hi2'
import { useLoginMutation } from '../../services/api'
import { setCredentials } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [login, { isLoading }] = useLoginMutation()

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const result = await login({ email: form.email, password: form.password }).unwrap()
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }))
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 👋`)
      navigate(redirect, { replace: true })
    } catch (err) {
      const msg = err?.data?.message || 'Login failed. Please try again.'
      if (err?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email first')
        navigate('/verify-otp', { state: { email: form.email } })
      } else {
        toast.error(msg)
        setErrors({ general: msg })
      }
    }
  }

  const handleDemoLogin = async (role = 'user') => {
    const credentials = role === 'admin'
      ? { email: 'admin@shopease.com', password: 'Admin@123' }
      : { email: 'john@example.com', password: 'User@123' }
    setForm(credentials)
    try {
      const result = await login(credentials).unwrap()
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }))
      toast.success(`Logged in as ${role === 'admin' ? 'Admin' : 'Customer'} demo!`)
      navigate(role === 'admin' ? '/admin' : redirect, { replace: true })
    } catch (err) {
      toast.error(err?.data?.message || 'Demo login failed')
    }
  }

  return (
    <>
      <Helmet><title>Login - ShopEase</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-1">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Login to access your account</p>

        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="label">Email Address</label>
            <div className="relative">
              <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5">
            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Login to ShopEase'}
          </button>
        </form>

        {/* Demo buttons */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 text-center mb-2">Quick demo login:</p>
          <div className="flex gap-2">
            <button onClick={() => handleDemoLogin('user')} disabled={isLoading} className="btn-secondary btn-sm flex-1 justify-center">
              👤 Customer
            </button>
            <button onClick={() => handleDemoLogin('admin')} disabled={isLoading} className="btn-secondary btn-sm flex-1 justify-center">
              🛡️ Admin
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Sign Up Free
          </Link>
        </p>
      </div>
    </>
  )
}

export default LoginPage
