import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { HiMagnifyingGlass, HiShieldCheck, HiXCircle } from 'react-icons/hi2'
import { useGetAdminUsersQuery, useUpdateUserRoleMutation, useBlockUserMutation } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Pagination from '../../components/ui/Pagination'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

const AdminCustomersPage = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 15, search, role: 'user' })
  const [updateRole] = useUpdateUserRoleMutation()
  const [blockUser] = useBlockUserMutation()

  const users = data?.users || []
  const totalPages = data?.pages || 1
  const total = data?.total || 0

  const handleBlock = async (id, isBlocked) => {
    if (!window.confirm(`${isBlocked ? 'Unblock' : 'Block'} this user?`)) return
    try {
      await blockUser({ id, isBlocked: !isBlocked }).unwrap()
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'}`)
    } catch { toast.error('Action failed') }
  }

  return (
    <>
      <Helmet><title>Customers - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <span className="badge badge-gray">{total}</span>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search customers by name or email..."
            className="input pl-9 text-sm py-2" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Customer', 'Email', 'Phone', 'Orders', 'Spent', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={8} className="py-20 text-center"><LoadingSpinner size="lg" className="mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-500">No customers found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="font-medium text-xs text-gray-900 dark:text-white">{u.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{u.phone || '—'}</td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-900 dark:text-white">{u.orderCount || 0}</td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-900 dark:text-white">{fmt(u.totalSpent)}</td>
                  <td className="py-3 px-4 text-[10px] text-gray-400">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : ''}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge text-[10px] ${u.isBlocked ? 'badge-danger' : u.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {u.isBlocked ? 'Blocked' : u.isVerified ? 'Active' : 'Unverified'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleBlock(u._id, u.isBlocked)}
                      className={`btn-ghost p-1.5 rounded-lg ${u.isBlocked ? 'text-green-600' : 'text-red-500'}`}
                      title={u.isBlocked ? 'Unblock' : 'Block'}>
                      {u.isBlocked ? <HiShieldCheck className="w-3.5 h-3.5" /> : <HiXCircle className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  )
}

export default AdminCustomersPage
