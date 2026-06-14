import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HiArrowLeft, HiShoppingBag, HiStar, HiCheckCircle, HiXCircle } from 'react-icons/hi2'
import { useGetUserByIdQuery, useToggleUserStatusMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const STATUS_BADGE = { pending: 'badge-warning', confirmed: 'badge-primary', processing: 'badge-primary', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' }
const fmt = n => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

export default function AdminCustomerDetailPage() {
  const { id } = useParams()
  const { data, isLoading, refetch } = useGetUserByIdQuery(id)
  const [toggleStatus, { isLoading: toggling }] = useToggleUserStatusMutation()

  const user = data?.user
  const orders = data?.orders || []

  const handleToggle = async () => {
    try { await toggleStatus(id).unwrap(); toast.success(`User ${user.isActive ? 'blocked' : 'unblocked'}`); refetch() }
    catch { toast.error('Failed to update user status') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!user) return <div className="card p-12 text-center"><p className="text-gray-500">Customer not found.</p></div>

  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length

  return (
    <>
      <Helmet><title>{user.name} - Admin</title></Helmet>

      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/customers" className="btn-ghost btn-icon"><HiArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Detail</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
          <div className="flex justify-center gap-2 mt-3">
            <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-gray'} capitalize`}>{user.role}</span>
            <span className={`badge ${user.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
              {user.isActive !== false ? 'Active' : 'Blocked'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : ''}
          </p>
          {user.role !== 'admin' && (
            <button onClick={handleToggle} disabled={toggling}
              className={`mt-4 w-full btn-sm justify-center ${user.isActive !== false ? 'btn-secondary text-red-600 border-red-300 hover:bg-red-50' : 'btn-primary'}`}>
              {toggling ? <LoadingSpinner size="sm" /> : (user.isActive !== false ? <><HiXCircle className="w-4 h-4" /> Block User</> : <><HiCheckCircle className="w-4 h-4" /> Unblock User</>)}
            </button>
          )}
        </div>

        {/* Stats + Orders */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-primary-600' },
              { label: 'Completed', value: deliveredOrders, color: 'text-green-600' },
              { label: 'Total Spent', value: fmt(totalSpent), color: 'text-accent-600' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Addresses */}
          {user.addresses?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Saved Addresses</h3>
              <div className="space-y-2">
                {user.addresses.map((addr, i) => (
                  <div key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="font-medium text-gray-900 dark:text-white">{addr.name} {addr.isDefault && <span className="badge badge-primary ml-2">Default</span>}</p>
                    <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order History */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HiShoppingBag className="w-4 h-4" /> Order History ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 8).map(order => (
                  <Link key={order._id} to={`/admin/orders/${order._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div>
                      <p className="font-mono text-xs text-gray-500">#{order.orderNumber || order._id?.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{fmt(order.totalAmount)}</p>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'} capitalize text-[10px] mt-0.5`}>{order.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
