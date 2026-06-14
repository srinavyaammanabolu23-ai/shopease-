import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiEye, HiEyeSlash, HiUser, HiEnvelope, HiLockClosed, HiPhone } from 'react-icons/hi2'
import { useRegisterMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [register, { isLoading }] = useRegisterMutation()

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian phone number'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Password must contain uppercase, lowercase, and a number'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const result = await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone }).unwrap()
      toast.success('Account created! Please verify your email.')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      const msg = err?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    }
  }

  return (
    <>
      <Helmet><title>Create Account - ShopEase</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-1">Create your account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Join millions of happy shoppers</p>

        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="label">Full Name</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reg-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className={`input pl-10 ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" autoComplete="name" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="label">Email Address</label>
            <div className="relative">
              <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reg-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className={`input pl-10 ${errors.email ? 'input-error' : ''}`} placeholder="your@email.com" autoComplete="email" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="reg-phone" className="label">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
            <div className="relative">
              <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reg-phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className={`input pl-10 ${errors.phone ? 'input-error' : ''}`} placeholder="98XXXXXXXX" autoComplete="tel" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="label">Password</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reg-password" type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="Min 8 chars, uppercase, number" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm" className="label">Confirm Password</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reg-confirm" type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password" autoComplete="new-password" />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.
          </p>

          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5">
            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </>
  )
}

export default RegisterPage
