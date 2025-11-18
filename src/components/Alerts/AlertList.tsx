import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@apollo/client/react'
import { Bell, X, AlertTriangle, Info, CheckCircle, Ban } from 'lucide-react'
import { UPDATE_ALERT } from '../../graphql/mutations/alertMutations'
import type { Alert } from '../../types/alert.types'
import { useAuthStore } from '../../store/useAuthStore'
import userApiRequests from '../../apiRequests/user'

interface AlertWithIndex extends Alert {
  originalIndex: number // Index gốc trong mảng user.alerts
}

export default function AlertList() {
  const { user, setUser } = useAuthStore()
  const [alerts, setAlerts] = useState<AlertWithIndex[]>([])
  const [updateAlert] = useMutation(UPDATE_ALERT)
  const hasFetchedUserId = useRef(false)

  // Auto-fetch user data từ /api/v1/auth/me CHỈ 1 LẦN nếu thiếu field 'id'
  useEffect(() => {
    const fetchUserIfNeeded = async () => {
      if (user && !user.id && !hasFetchedUserId.current) {
        hasFetchedUserId.current = true
        console.log('🔄 User missing ID, fetching from /api/v1/auth/me...')
        try {
          const res = await userApiRequests.getProfile()
          if (res.status === 200 && res.data?.data) {
            setUser(res.data.data)
            console.log('✅ User fetched with ID:', res.data.data.id)
          }
        } catch (error) {
          console.error('❌ Failed to fetch user:', error)
        }
      }
    }
    fetchUserIfNeeded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch alerts khi user bấm mở panel (không polling tự động nữa)
  const fetchUserAlerts = async () => {
    if (!user) return

    try {
      const res = await userApiRequests.getProfile()
      if (res.status === 200 && res.data?.data) {
        setUser(res.data.data)
      }
    } catch (error) {
      console.error('❌ Failed to fetch user alerts:', error)
    }
  }

  useEffect(() => {
    console.log('🔔 AlertList - User:', user)
    console.log('🔔 AlertList - User alerts:', user?.alerts)

    if (user?.alerts) {
      // Lọc alerts chưa bị xóa, giữ nguyên index gốc
      const activeAlerts = user.alerts
        .map((alert: Alert, originalIndex: number) => ({ ...alert, originalIndex }))
        .filter((alert: AlertWithIndex) => !alert.is_deleted)
        .sort((a: Alert, b: Alert) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      console.log('🔔 AlertList - Active alerts:', activeAlerts)
      setAlerts(activeAlerts)
    }
  }, [user?.alerts])

  const handleMarkAsRead = async (originalIndex: number) => {
    if (!user?.id) return

    try {
      await updateAlert({
        variables: {
          user_id: user.id, // Backend cần user.id (string)
          alert_index: originalIndex, // Index gốc trong mảng user.alerts
          is_read: true
        }
      })

      // Cập nhật local state
      setAlerts((prev) =>
        prev.map((alert) => (alert.originalIndex === originalIndex ? { ...alert, is_read: true } : alert))
      )

      // Cập nhật user store
      if (user.alerts) {
        const updatedAlerts = [...user.alerts]
        updatedAlerts[originalIndex] = { ...updatedAlerts[originalIndex], is_read: true }
        setUser({ ...user, alerts: updatedAlerts })
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error)
    }
  }

  const handleDelete = async (originalIndex: number) => {
    if (!user?.id) return

    try {
      await updateAlert({
        variables: {
          user_id: user.id,
          alert_index: originalIndex,
          is_deleted: true
        }
      })

      // Cập nhật local state - xóa khỏi danh sách hiển thị
      setAlerts((prev) => prev.filter((alert) => alert.originalIndex !== originalIndex))

      // Cập nhật user store
      if (user.alerts) {
        const updatedAlerts = [...user.alerts]
        updatedAlerts[originalIndex] = { ...updatedAlerts[originalIndex], is_deleted: true }
        setUser({ ...user, alerts: updatedAlerts })
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'BLOCK_REGISTRATION':
        return <Ban className='w-5 h-5 text-red-600' />
      case 'WARNING':
        return <AlertTriangle className='w-5 h-5 text-yellow-600' />
      case 'SUCCESS':
        return <CheckCircle className='w-5 h-5 text-green-600' />
      default:
        return <Info className='w-5 h-5 text-blue-600' />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'BLOCK_REGISTRATION':
        return 'bg-red-50 border-red-200'
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200'
      case 'SUCCESS':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = alerts.filter((alert) => !alert.is_read).length

  // Xử lý khi bấm vào nút chuông - fetch alerts mới
  const handleTogglePanel = async () => {
    setIsOpen(!isOpen)
    // Fetch alerts mới khi mở panel
    if (!isOpen) {
      await fetchUserAlerts()
    }
  }

  return (
    <div className='relative'>
      {/* Bell Icon Button - Giống style menu items */}
      <button
        onClick={handleTogglePanel}
        className='relative flex items-center gap-2 px-4 py-2 text-white font-bold transition-all hover:bg-gray-800 rounded'
        title='Thông báo'
      >
        <div className='relative'>
          <Bell className='w-5 h-5' />
          {unreadCount > 0 && (
            <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-pulse px-1'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span>Thông báo</span>
        {/* Gạch dưới khi panel đang mở */}
        {isOpen && <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-white'></div>}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />

          {/* Alert Panel - Rộng hơn */}
          <div className='absolute right-0 mt-6 w-[500px] max-h-[80vh] overflow-hidden bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
            {/* Alert List */}
            {alerts.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>
                <Bell className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p className='text-sm'>Không có thông báo nào</p>
              </div>
            ) : (
              <div className='max-h-[calc(80vh-60px)] overflow-y-auto divide-y divide-gray-100'>
                {alerts.map((alert) => (
                  <div
                    key={alert.originalIndex}
                    className={`p-4 ${getAlertColor(alert.type)} ${!alert.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'} transition-all hover:bg-gray-50 relative`}
                  >
                    {/* Nút X ở góc trên bên phải */}
                    <button
                      onClick={() => handleDelete(alert.originalIndex)}
                      className='absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors'
                      title='Xóa thông báo'
                    >
                      <X className='w-4 h-4' />
                    </button>

                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 mt-0.5'>{getAlertIcon(alert.type)}</div>
                      <div className='flex-1 min-w-0 pr-6'>
                        <h4
                          className={`text-base font-semibold mb-2 ${!alert.is_read ? 'text-gray-900' : 'text-gray-700'}`}
                        >
                          {alert.title}
                        </h4>
                        <p className='text-sm text-gray-600 leading-relaxed mb-3'>{alert.message}</p>
                        <div className='flex items-center justify-between gap-3'>
                          <span className='text-xs text-gray-500'>
                            {new Date(alert.created_at).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {!alert.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(alert.originalIndex)}
                              className='flex items-center gap-1.5 text-xs text-white bg-green-500 hover:bg-green-600 font-medium px-3 py-1.5 rounded transition-colors'
                              title='Đánh dấu đã đọc'
                            >
                              <CheckCircle className='w-3.5 h-3.5' />
                              <span>Đã đọc</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
