import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useVerifyOTPMutation, useResendOTPMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const OTPVerificationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef([])
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation()
  const [resendOTP, { isLoading: resending }] = useResendOTPMutation()

  useEffect(() => {
    if (!email) navigate('/register')
  }, [email, navigate])

  useEffect(() => {
    let t = null
    if (timer > 0) t = setTimeout(() => setTimer(timer - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code) => {
    const otpCode = code || otp.join('')
    if (otpCode.length < 6) { toast.error('Enter all 6 digits'); return }
    try {
      await verifyOTP({ email, otp: otpCode }).unwrap()
      toast.success('Email verified successfully! 🎉')
      navigate('/login', { state: { verified: true } })
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap()
      setTimer(60)
      toast.success('New OTP sent to your email!')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend OTP')
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('Text').slice(0, 6).replace(/\D/g, '')
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  return (
    <>
      <Helmet><title>Verify OTP - ShopEase</title></Helmet>
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-1">Verify your email</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          We've sent a 6-digit code to
        </p>
        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-6">{email}</p>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 transition-colors"
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={isLoading || otp.some(d => !d)}
          className="btn-primary w-full justify-center py-2.5 mb-4"
        >
          {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Verify OTP'}
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {timer > 0 ? (
            <p>Resend OTP in <span className="font-semibold text-primary-600 dark:text-primary-400">{timer}s</span></p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default OTPVerificationPage
