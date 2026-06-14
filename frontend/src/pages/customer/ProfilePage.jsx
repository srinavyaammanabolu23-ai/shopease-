import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { HiUser, HiEnvelope, HiPhone, HiMapPin, HiShoppingBag, HiHeart, HiLockClosed, HiPencil, HiPlus, HiTrash, HiCheckCircle } from 'react-icons/hi2'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { updateUser } from '../../store/slices/authSlice'
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useAddAddressMutation, useDeleteAddressMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [activeTab, setActiveTab] = useState('profile')
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ type: 'home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' })

  const { data: profileData, refetch } = useGetProfileQuery()
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation()
  const [addAddress, { isLoading: addingAddr }] = useAddAddressMutation()
  const [deleteAddress] = useDeleteAddressMutation()

  const profile = profileData?.user || user
  const addresses = profile?.addresses || []

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const result = await updateProfile(profileForm).unwrap()
      dispatch(updateUser(result.user))
      setEditProfile(false)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err?.data?.message || 'Update failed') }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return }
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }).unwrap()
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err?.data?.message || 'Failed to change password') }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await addAddress(newAddress).unwrap()
      await refetch()
      setShowAddAddress(false)
      setNewAddress({ type: 'home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' })
      toast.success('Address added!')
    } catch (err) { toast.error(err?.data?.message || 'Failed') }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id).unwrap()
      await refetch()
      toast.success('Address removed')
    } catch { toast.error('Failed to delete') }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiUser },
    { id: 'addresses', label: 'Addresses', icon: HiMapPin },
    { id: 'security', label: 'Security', icon: HiLockClosed },
  ]

  return (
    <>
      <Helmet><title>My Profile - ShopEase</title></Helmet>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">My Account</h1>

        {/* User header card */}
        <div className="card p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-black shrink-0">
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h2>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              {profile?.isVerified ? <><HiCheckCircle className="w-3.5 h-3.5 text-green-500" /> Verified Account</> : '⚠ Email not verified'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    <Icon className="w-4 h-4" />{tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900 dark:text-white">Personal Information</h2>
                  <button onClick={() => setEditProfile(!editProfile)} className="btn-secondary btn-sm gap-1">
                    <HiPencil className="w-3.5 h-3.5" /> {editProfile ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="input" />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="input" />
                    </div>
                    <button type="submit" disabled={updating} className="btn-primary">
                      {updating ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {[
                      { icon: HiUser, label: 'Full Name', value: profile?.name },
                      { icon: HiEnvelope, label: 'Email', value: profile?.email },
                      { icon: HiPhone, label: 'Phone', value: profile?.phone || 'Not added' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="btn-primary btn-sm gap-1">
                    <HiPlus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-5 space-y-3">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className="label">Full Name</label>
                        <input value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="input" required /></div>
                      <div className="col-span-2"><label className="label">Phone</label>
                        <input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="input" required /></div>
                      <div className="col-span-2"><label className="label">Street</label>
                        <input value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="input" required /></div>
                      <div><label className="label">City</label>
                        <input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="input" required /></div>
                      <div><label className="label">State</label>
                        <input value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="input" required /></div>
                      <div><label className="label">Pincode</label>
                        <input value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="input" maxLength={6} required /></div>
                      <div><label className="label">Type</label>
                        <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} className="select">
                          <option value="home">Home</option><option value="work">Work</option><option value="other">Other</option>
                        </select></div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={addingAddr} className="btn-primary btn-sm">
                        {addingAddr ? <LoadingSpinner size="xs" color="white" /> : 'Save'}
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="btn-secondary btn-sm">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <HiMapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>No addresses saved yet</p>
                    </div>
                  ) : addresses.map(addr => (
                    <div key={addr._id} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <HiMapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</span>
                          <span className="badge badge-gray capitalize text-xs">{addr.type}</span>
                          {addr.isDefault && <span className="badge badge-primary text-xs">Default</span>}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-gray-500">{addr.phone}</p>
                      </div>
                      <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-5">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="label">Current Password</label>
                    <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} className="input" required />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} className="input" required minLength={8} />
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} className="input" required />
                  </div>
                  <button type="submit" disabled={changingPw} className="btn-primary">
                    {changingPw ? <LoadingSpinner size="sm" color="white" /> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
