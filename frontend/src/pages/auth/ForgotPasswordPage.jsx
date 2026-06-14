import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiEnvelope, HiArrowLeft } from 'react-icons/hi2'
import { useForgotPasswordMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    try {
      await forgotPassword({ email: email.trim() }).unwrap()
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send reset email')
    }
  }

  if (sent) {
    return (
      <>
        <Helmet><title>Check Your Email - ShopEase</title></Helmet>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiEnvelope className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            We've sent a password reset link to <strong className="text-gray-900 dark:text-white">{email}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-6">Didn't receive it? Check spam or try again in a few minutes.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setSent(false)} className="btn-secondary w-full justify-center">
              Try a different email
            </button>
            <Link to="/login" className="btn-ghost w-full justify-center text-sm">
              <HiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet><title>Forgot Password - ShopEase</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-1">Forgot password?</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">No worries! We'll send you reset instructions.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="label">Email Address</label>
            <div className="relative">
              <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input pl-10" placeholder="your@email.com" required autoFocus />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5">
            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Send Reset Link'}
          </button>
        </form>
        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-5 transition-colors">
          <HiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </>
  )
}

export default ForgotPasswordPage
