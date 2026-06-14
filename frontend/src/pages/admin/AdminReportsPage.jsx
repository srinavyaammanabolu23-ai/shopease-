import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiChartBar, HiArrowTrendingUp, HiArrowTrendingDown, HiCalendar } from 'react-icons/hi2'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { useGetOrderAnalyticsQuery, useGetAdminUserStatsQuery } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']
const fmt = n => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('6months')
  const { data: analytics, isLoading } = useGetOrderAnalyticsQuery({ period })
  const { data: userStats } = useGetAdminUserStatsQuery()

  const revenueData = analytics?.revenueByMonth || []
  const orderStatusData = analytics?.ordersByStatus || []
  const customerData = analytics?.newCustomers || []
  const topProducts = analytics?.topProducts || []
  const summary = analytics?.summary || {}

  const metrics = [
    { label: 'Total Revenue', value: fmt(summary.totalRevenue), change: summary.revenueGrowth, color: 'text-green-600' },
    { label: 'Total Orders', value: (summary.totalOrders || 0).toLocaleString(), change: summary.ordersGrowth, color: 'text-primary-600' },
    { label: 'Avg Order Value', value: fmt(summary.avgOrderValue), change: null, color: 'text-accent-600' },
    { label: 'New Customers', value: (userStats?.newThisMonth || 0).toLocaleString(), change: userStats?.growth, color: 'text-violet-600' },
  ]

  return (
    <>
      <Helmet><title>Reports - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Track your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <HiCalendar className="w-4 h-4 text-gray-400" />
          <select value={period} onChange={e => setPeriod(e.target.value)} className="select text-sm py-2">
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{m.label}</p>
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                {m.change !== null && m.change !== undefined && (
                  <div className={`flex items-center gap-1 text-xs mt-2 font-medium ${m.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.change >= 0 ? <HiArrowTrendingUp className="w-3.5 h-3.5" /> : <HiArrowTrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(m.change || 0).toFixed(1)}% vs last period
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="card p-6 mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Revenue Trend</h2>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [fmt(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <HiChartBar className="w-12 h-12 mb-3 opacity-40" />
                <p>No revenue data yet for this period</p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Orders by Status */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-5">Orders by Status</h2>
              {orderStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="status">
                        {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {orderStatusData.map((s, i) => (
                      <div key={s.status} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="capitalize text-gray-600 dark:text-gray-400">{s.status}</span>
                        <span className="ml-auto font-bold text-gray-900 dark:text-white">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="flex items-center justify-center h-48 text-gray-400">No order data yet</div>}
            </div>

            {/* New Customers */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-5">New Customers</h2>
              {customerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Customers" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-48 text-gray-400">No customer data yet</div>}
            </div>
          </div>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-5">Top Selling Products</h2>
              <div className="space-y-3">
                {topProducts.slice(0, 10).map((p, i) => (
                  <div key={p._id} className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                    <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sold} units sold</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{fmt(p.revenue)}</p>
                      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (p.sold / (topProducts[0]?.sold || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
