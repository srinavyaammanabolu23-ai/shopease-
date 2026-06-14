import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiLockClosed, HiEye, HiEyeSlash, HiCheckCircle } from 'react-icons/hi2'
import { useResetPasswordMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const validate = () => {
    const errs = {}
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters required'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must have uppercase, lowercase, number'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await resetPassword({ token, email, password: form.password }).unwrap()
      setSuccess(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err?.data?.message || 'Reset failed. Link may have expired.')
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your password has been reset successfully. Please login with your new password.</p>
        <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Reset Password - ShopEase</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-1">Reset password</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create a strong new password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-pw" className="label">New Password</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reset-pw" type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 8 chars" autoFocus />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="reset-confirm" className="label">Confirm New Password</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reset-confirm" type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat new password" />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5">
            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </>
  )
}

export default ResetPasswordPage
