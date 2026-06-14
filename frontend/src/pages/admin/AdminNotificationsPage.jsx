import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiBell, HiCheckCircle, HiTrash, HiShoppingCart, HiUsers, HiStar, HiArrowPath } from 'react-icons/hi2'
import {
  useGetNotificationsQuery, useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation, useDeleteNotificationMutation
} from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const typeIcon = (type) => {
  if (type === 'order') return { Icon: HiShoppingCart, bg: 'bg-primary-100 dark:bg-primary-900/30', color: 'text-primary-600' }
  if (type === 'user') return { Icon: HiUsers, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600' }
  if (type === 'review') return { Icon: HiStar, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600' }
  return { Icon: HiBell, bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600' }
}

export default function AdminNotificationsPage() {
  const { data, isLoading, refetch } = useGetNotificationsQuery()
  const [markRead] = useMarkNotificationReadMutation()
  const [markAll] = useMarkAllNotificationsReadMutation()
  const [deleteNotif] = useDeleteNotificationMutation()

  const notifications = data?.notifications || []
  const unread = notifications.filter(n => !n.isRead).length

  const handleMarkRead = async (id) => {
    try { await markRead(id).unwrap(); refetch() } catch { toast.error('Failed to mark read') }
  }

  const handleMarkAll = async () => {
    try { await markAll().unwrap(); refetch(); toast.success('All marked as read') } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    try { await deleteNotif(id).unwrap(); refetch(); toast.success('Notification deleted') } catch { toast.error('Failed to delete') }
  }

  return (
    <>
      <Helmet><title>Notifications - ShopEase Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unread > 0 && <p className="text-primary-600 text-sm mt-1 font-medium">{unread} unread notification{unread !== 1 ? 's' : ''}</p>}
        </div>
        <div className="flex gap-3">
          {unread > 0 && (
            <button onClick={handleMarkAll} className="btn-secondary">
              <HiCheckCircle className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <button onClick={refetch} className="btn-ghost btn-icon"><HiArrowPath className="w-4 h-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiBell className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Caught Up!</h2>
          <p className="text-gray-500">No notifications to show right now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const { Icon, bg, color } = typeIcon(notif.type)
            return (
              <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`card p-4 flex items-start gap-4 transition-all ${!notif.isRead ? 'border-l-4 border-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notif.message || notif.title}
                  </p>
                  {notif.body && <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif._id)}
                      className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 transition-colors" title="Mark as read">
                      <HiCheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Delete">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}
