import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  HiBanknotes, HiShoppingCart, HiUsers, HiShoppingBag,
  HiArrowTrendingUp, HiArrowTrendingDown, HiClock, HiEye
} from 'react-icons/hi2'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useGetOrderAnalyticsQuery, useGetAllOrdersQuery, useGetAdminUserStatsQuery } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { format } from 'date-fns'

const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

const STATUS_BADGE = {
  pending: 'badge-warning',
  confirmed: 'badge-primary',
  processing: 'badge-primary',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

const StatCard = ({ title, value, icon: Icon, change, color, prefix = '', loading }) => {
  const isUp = change >= 0
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? <HiArrowTrendingUp className="w-3.5 h-3.5" /> : <HiArrowTrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">
        {loading ? <span className="skeleton inline-block w-24 h-7 rounded" /> : `${prefix}${value}`}
      </p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </motion.div>
  )
}

const AdminDashboard = () => {
  const [period, setPeriod] = useState('6months')
  const { data: analytics, isLoading: analyticsLoading } = useGetOrderAnalyticsQuery({ period })
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({ page: 1, limit: 10, sort: 'createdAt', sortOrder: -1 })
  const { data: userStats } = useGetAdminUserStatsQuery()

  const stats = analytics?.summary || {}
  const revenueData = analytics?.revenueByMonth || []
  const orderStatusData = analytics?.ordersByStatus || []
  const customerData = analytics?.newCustomers || []
  const recentOrders = ordersData?.orders || []
  const topProducts = analytics?.topProducts || []

  return (
    <>
      <Helmet><title>Dashboard - ShopEase Admin</title></Helmet>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={fmt(stats.totalRevenue)} icon={HiBanknotes} color="bg-green-500" change={stats.revenueGrowth} loading={analyticsLoading} />
        <StatCard title="Total Orders" value={(stats.totalOrders || 0).toLocaleString()} icon={HiShoppingCart} color="bg-primary-500" change={stats.ordersGrowth} loading={analyticsLoading} />
        <StatCard title="Total Customers" value={(userStats?.total || 0).toLocaleString()} icon={HiUsers} color="bg-violet-500" change={userStats?.growth} loading={!userStats} />
        <StatCard title="Products" value={(stats.totalProducts || 0).toLocaleString()} icon={HiShoppingBag} color="bg-amber-500" loading={analyticsLoading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
            <select value={period} onChange={e => setPeriod(e.target.value)} className="select text-xs py-1.5 w-auto">
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [fmt(v), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Orders by Status</h2>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-48"><LoadingSpinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="count" nameKey="status">
                  {orderStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1 mt-2">
            {orderStatusData.slice(0, 4).map((s, i) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="capitalize text-gray-600 dark:text-gray-400">{s.status}</span>
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {ordersLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Order', 'Customer', 'Amount', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentOrders.slice(0, 8).map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-xs text-gray-500">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                      <td className="py-2.5 px-2">
                        <p className="font-medium text-gray-900 dark:text-white text-xs">{order.user?.name || 'User'}</p>
                        <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-gray-900 dark:text-white text-xs">{fmt(order.totalAmount)}</td>
                      <td className="py-2.5 px-2">
                        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'} text-[10px] capitalize`}>{order.status}</span>
                      </td>
                      <td className="py-2.5 px-2 text-[10px] text-gray-400">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM d') : ''}
                      </td>
                      <td className="py-2.5 px-2">
                        <Link to={`/admin/orders/${order._id}`} className="text-primary-600 hover:text-primary-700">
                          <HiEye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">{i + 1}</span>
                <img src={p.images?.[0]?.url || 'https://via.placeholder.com/32'} alt={p.name}
                  className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.sold} sold</p>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0">{fmt(p.revenue)}</span>
              </div>
            ))}
            {topProducts.length === 0 && !analyticsLoading && (
              <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Growth Chart */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">New Customer Growth</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={customerData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

export default AdminDashboard
