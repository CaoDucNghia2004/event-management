import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { Notification } from '../../types/notification.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import config from '../../constants/config'
import { getAccessTokenFromLS } from '../../utils/utils'

interface NotificationListProps {
  eventId: string
  enableRealtime?: boolean // Bật/tắt SSE real-time
}

export default function NotificationList({ eventId, enableRealtime = true }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    // Nếu không bật realtime → Dùng polling thay vì SSE
    if (!enableRealtime) {
      const fetchNotifications = async () => {
        try {
          const token = getAccessTokenFromLS()
          const response = await fetch(`${config.BACKEND_URL}/api/v1/notification`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          const data = await response.json()
          const allNotifications = data.data?.data || data.data || []

          // Filter notifications for this event
          const eventNotifications = allNotifications
            .filter((n: Notification) => n.event_id === eventId)
            .sort(
              (a: Notification, b: Notification) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          // ensure messages are ordered oldest -> newest (newest at bottom)
          setNotifications(eventNotifications)
          setLoading(false)
        } catch (error) {
          console.error('Error fetching notifications:', error)
          setLoading(false)
        }
      }

      // Fetch ngay khi mount
      fetchNotifications()

      // Polling mỗi 5 giây
      const interval = setInterval(fetchNotifications, 5000)

      return () => clearInterval(interval)
    }

    // Nếu bật realtime → Dùng SSE
    // Kết nối SSE
    const connectSSE = () => {
      const token = getAccessTokenFromLS()
      const url = `${config.BACKEND_URL}/api/v1/notification/${eventId}?token=${token}`
      console.log('🔌 Connecting to SSE:', url)

      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      // Nhận danh sách ban đầu
      eventSource.addEventListener('initial', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 Initial notifications:', data)
          // Sort to ensure messages are ordered oldest -> newest (newest at bottom)
          const sortedNotifications = (data.notifications || [])
            .slice()
            .sort(
              (a: Notification, b: Notification) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          setNotifications(sortedNotifications)
          setLoading(false)
          setConnected(true)
        } catch (error) {
          console.error('Error parsing initial data:', error)
        }
      })

      // Nhận notification mới
      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data)
          console.log('🔔 New notification:', notification)
          // Thêm vào cuối mảng (tin nhắn mới xuống dưới)
          setNotifications((prev) => [...prev, notification])
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      })

      // Timeout
      eventSource.addEventListener('timeout', () => {
        console.log('⏱️ SSE timeout')
        eventSource.close()
        setConnected(false)
      })

      // Lỗi kết nối
      eventSource.onerror = (error) => {
        console.error('❌ SSE error:', error)
        eventSource.close()
        setConnected(false)
        setLoading(false)
      }

      // onmessage không cần xử lý vì backend chỉ gửi comment heartbeat
      // Comment (": heartbeat") sẽ tự động bị browser bỏ qua
    }

    connectSSE()

    // Cleanup khi unmount
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Closing SSE connection')
        eventSourceRef.current.close()
      }
    }
  }, [eventId, enableRealtime])

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
        <span className='ml-3 text-gray-600'>Đang tải tin nhắn...</span>
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Messages - Chat style */}
      {notifications.length === 0 ? (
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <h4 className='text-base font-semibold text-gray-900 mb-1'>Chưa có tin nhắn</h4>
            <p className='text-sm text-gray-500'>Tin nhắn từ Ban tổ chức sẽ xuất hiện tại đây</p>
            {enableRealtime && connected && (
              <div className='mt-3 inline-flex items-center gap-2 text-xs text-green-600'>
                <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></span>
                Đang kết nối real-time
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='flex-1 space-y-4 custom-scrollbar'>
          {notifications.map((notification, index) => (
            <div key={notification.id || `notification-${index}`} className='flex items-start gap-3 animate-fadeIn'>
              {/* Avatar/Icon - Ban tổ chức */}
              <div className='flex-shrink-0'>
                <div className='relative'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold'>
                    BTC
                  </div>
                  <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-50 rounded-full'></div>
                </div>
              </div>

              {/* Message Bubble */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-baseline gap-2 mb-1'>
                  <span className='text-sm font-semibold text-gray-900'>Ban tổ chức</span>
                  <time className='text-xs text-gray-400'>{formatDateTime(notification.created_at)}</time>
                </div>
                <div className='bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100'>
                  <p className='text-gray-800 leading-relaxed whitespace-pre-wrap text-sm'>{notification.message}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Real-time indicator at bottom */}
          {enableRealtime && connected && (
            <div className='flex items-center justify-center py-2'>
              <div className='flex items-center gap-2 text-xs text-gray-400'>
                <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></span>
                Đang nhận tin nhắn mới
              </div>
            </div>
          )}

          {/* Archive indicator for non-realtime (COMPLETED events) */}
          {!enableRealtime && notifications.length > 0 && (
            <div className='flex items-center justify-center py-2'>
              <div className='flex items-center gap-2 text-xs text-gray-400'>
                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full'></span>
                Lịch sử tin nhắn (Sự kiện đã kết thúc)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
