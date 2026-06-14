import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiCreditCard, HiMapPin, HiPhone, HiUser, HiCheckCircle, HiPlus } from 'react-icons/hi2'
import { useSelector } from 'react-redux'
import { useGetCartQuery, useGetProfileQuery, useCreateOrderMutation, useAddAddressMutation, useCreatePaymentSessionMutation } from '../../services/api'
import { selectCurrentUser } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
]

const CheckoutPage = () => {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [step, setStep] = useState(1) // 1=address, 2=payment, 3=review
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ type: 'home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' })

  const { data: cartData } = useGetCartQuery()
  const { data: profileData, refetch: refetchProfile } = useGetProfileQuery()
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation()
  const [createPaymentSession, { isLoading: creatingSession }] = useCreatePaymentSessionMutation()
  const [addAddress, { isLoading: addingAddress }] = useAddAddressMutation()

  const isLoading = placingOrder || creatingSession

  const cart = cartData?.cart || { items: [], couponDiscount: 0 }
  const addresses = profileData?.user?.addresses || []
  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0
  const couponDiscount = cart.couponDiscount || 0
  const shipping = subtotal - couponDiscount >= 499 ? 0 : 49
  const total = Math.max(0, subtotal - couponDiscount) + shipping

  const defaultAddress = selectedAddress || addresses.find(a => a.isDefault) || addresses[0]

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await addAddress(newAddress).unwrap()
      await refetchProfile()
      setShowAddAddress(false)
      setNewAddress({ type: 'home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' })
      toast.success('Address added!')
    } catch (err) { toast.error(err?.data?.message || 'Failed to add address') }
  }

  const handlePlaceOrder = async () => {
    if (!defaultAddress) { toast.error('Please add a delivery address'); return }
    try {
      if (paymentMethod === 'cod') {
        const result = await createOrder({
          shippingAddress: defaultAddress,
          paymentMethod,
          couponCode: cart.coupon?.code,
        }).unwrap()
        toast.success('🎉 Order placed successfully!')
        navigate(`/orders/${result.order._id}/track`)
      } else {
        toast.loading('Redirecting to secure payment page...', { id: 'payment-redirect' })
        const result = await createPaymentSession({
          shippingAddress: defaultAddress,
          paymentMethod,
          notes: '',
        }).unwrap()
        toast.dismiss('payment-redirect')
        if (result.url) {
          window.location.href = result.url
        } else {
          toast.error('Payment initialization failed')
        }
      }
    } catch (err) { 
      toast.dismiss('payment-redirect')
      toast.error(err?.data?.message || 'Failed to process checkout') 
    }
  }

  const steps = [
    { n: 1, label: 'Delivery' },
    { n: 2, label: 'Payment' },
    { n: 3, label: 'Review' },
  ]

  return (
    <>
      <Helmet><title>Checkout - ShopEase</title></Helmet>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {step > s.n ? <HiCheckCircle className="w-5 h-5" /> : s.n}
              </div>
              <span className={`ml-2 text-sm font-medium ${step === s.n ? 'text-primary-600' : 'text-gray-500'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 w-12 ${step > s.n + 1 ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="card p-6">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <HiMapPin className="w-5 h-5 text-primary-600" /> Delivery Address
                </h2>
                <div className="space-y-3 mb-5">
                  {addresses.map(addr => (
                    <label key={addr._id} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress?._id === addr._id || (!selectedAddress && addr.isDefault)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}>
                      <input type="radio" name="address" value={addr._id}
                        checked={selectedAddress?._id === addr._id || (!selectedAddress && addr.isDefault)}
                        onChange={() => setSelectedAddress(addr)} className="mt-0.5 text-primary-600" />
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</span>
                          <span className="badge badge-gray capitalize">{addr.type}</span>
                          {addr.isDefault && <span className="badge badge-primary">Default</span>}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{addr.street}</p>
                        <p className="text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-gray-500 flex items-center gap-1 mt-1"><HiPhone className="w-3.5 h-3.5" />{addr.phone}</p>
                      </div>
                    </label>
                  ))}

                  <button onClick={() => setShowAddAddress(!showAddAddress)}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors">
                    <HiPlus className="w-4 h-4" /> Add New Address
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 space-y-3 mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="label">Full Name</label>
                        <input value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})}
                          className="input" placeholder="Recipient name" required />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Phone</label>
                        <input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                          className="input" placeholder="10-digit phone" required />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Street Address</label>
                        <input value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                          className="input" placeholder="House/flat, street, area" required />
                      </div>
                      <div>
                        <label className="label">City</label>
                        <input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                          className="input" placeholder="City" required />
                      </div>
                      <div>
                        <label className="label">State</label>
                        <input value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                          className="input" placeholder="State" required />
                      </div>
                      <div>
                        <label className="label">Pincode</label>
                        <input value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                          className="input" placeholder="6-digit pincode" required maxLength={6} />
                      </div>
                      <div>
                        <label className="label">Type</label>
                        <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} className="select">
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={addingAddress} className="btn-primary btn-sm">
                        {addingAddress ? <LoadingSpinner size="xs" color="white" /> : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="btn-secondary btn-sm">Cancel</button>
                    </div>
                  </form>
                )}

                <button onClick={() => setStep(2)} disabled={!addresses.length}
                  className="btn-primary w-full justify-center py-3 mt-2">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card p-6">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <HiCreditCard className="w-5 h-5 text-primary-600" /> Payment Method
                </h2>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map(method => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)} className="text-primary-600" />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 justify-center">Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="card p-6">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Review Your Order</h2>
                {/* Delivery address summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivering to:</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{defaultAddress?.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{defaultAddress?.street}, {defaultAddress?.city}, {defaultAddress?.state} - {defaultAddress?.pincode}</p>
                  <p className="text-sm text-gray-500">{defaultAddress?.phone}</p>
                </div>
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cart.items?.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'} alt={item.product?.name}
                        className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.product?.name || item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm">{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">← Back</button>
                  <button onClick={handlePlaceOrder} disabled={isLoading} className="btn-primary flex-1 justify-center py-3">
                    {isLoading ? <LoadingSpinner size="sm" color="white" /> : `Place Order • ${fmt(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="card p-5 h-fit sticky top-24">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {cart.items?.map(item => (
                <div key={item._id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="line-clamp-1 flex-1 mr-2">{item.product?.name || item.name} ×{item.quantity}</span>
                  <span className="shrink-0">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{fmt(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
