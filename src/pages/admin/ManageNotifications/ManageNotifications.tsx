import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'
import type { Event } from '../../../types/event.types'
import type { Notification } from '../../../types/notification.types'
import { Search, Send, Loader2, Trash2, Edit } from 'lucide-react'
import Swal from 'sweetalert2'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import notificationApiRequests from '../../../apiRequests/notification'
import { getUserIdFromToken } from '../../../utils/utils'
import EditNotificationModal from './EditNotificationModal'

interface EventsData {
  events?: Event[]
}

interface EventWithNotifications extends Event {
  notifications: Notification[]
  unreadCount: number
}

export default function ManageNotifications() {
  const [searchEvent, setSearchEvent] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<EventWithNotifications | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch events
  const { data: eventsData, loading: eventsLoading } = useQuery<EventsData>(GET_ALL_EVENTS)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await notificationApiRequests.getAll()
      const notificationsData = response.data.data.data || response.data.data || []
      setNotifications(notificationsData)
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedEvent?.notifications])

  // Group events with their notifications
  const eventsWithNotifications = useMemo(() => {
    if (!eventsData?.events) return []

    const mappedEvents = eventsData.events.map((event) => {
      const eventNotifications = notifications.filter((n) => {
        // Convert both to string and trim to ensure comparison works
        const notifEventId = String(n.event_id).trim()
        const eventId = String(event.id).trim()
        return notifEventId === eventId
      })

      return {
        ...event,
        notifications: eventNotifications.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
        unreadCount: 0 // Can be implemented later
      }
    })

    return mappedEvents
      .filter((event) => {
        // Show events that are OPEN, ONGOING, or ENDED (if has notifications)
        const isActiveEvent = event.current_status === 'OPEN' || event.current_status === 'ONGOING'
        const isEndedWithMessages = event.current_status === 'ENDED' && event.notifications.length > 0
        return isActiveEvent || isEndedWithMessages
      })
      .filter((event) => {
        // Search filter
        if (searchEvent) {
          return event.title.toLowerCase().includes(searchEvent.toLowerCase())
        }
        return true
      })
      .sort((a, b) => {
        // 1. ENDED events go to bottom
        const aIsEnded = a.current_status === 'ENDED'
        const bIsEnded = b.current_status === 'ENDED'
        if (aIsEnded && !bIsEnded) return 1
        if (!aIsEnded && bIsEnded) return -1

        // 2. Sort by latest notification
        const aLatest = a.notifications[a.notifications.length - 1]?.created_at || a.created_at
        const bLatest = b.notifications[b.notifications.length - 1]?.created_at || b.created_at
        return new Date(bLatest).getTime() - new Date(aLatest).getTime()
      })
  }, [eventsData, notifications, searchEvent])

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedEvent) return

    const organizerId = getUserIdFromToken()
    if (!organizerId) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không tìm thấy thông tin người dùng!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    setSending(true)
    try {
      await notificationApiRequests.create({
        event_id: selectedEvent.id,
        organizer_id: organizerId,
        message: message.trim()
      })

      setMessage('')
      await fetchNotifications()

      // Update selected event with new notification
      const updatedNotifications = await notificationApiRequests.getAll()
      const notificationsData = updatedNotifications.data.data.data || updatedNotifications.data.data || []
      const eventNotifications = notificationsData.filter((n: Notification) => n.event_id === selectedEvent.id)
      setSelectedEvent({
        ...selectedEvent,
        notifications: eventNotifications.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      })
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error?.response?.data?.message || 'Không thể gửi tin nhắn!',
        confirmButtonText: 'Đóng'
      })
    } finally {
      setSending(false)
    }
  }

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa tin nhắn này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      try {
        await notificationApiRequests.delete(notificationId)
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Xóa tin nhắn thành công!',
          showConfirmButton: false,
          timer: 1500
        })
        await fetchNotifications()

        // Update selected event
        if (selectedEvent) {
          const updatedNotifications = await notificationApiRequests.getAll()
          const notificationsData = updatedNotifications.data.data.data || updatedNotifications.data.data || []
          const eventNotifications = notificationsData.filter((n: Notification) => n.event_id === selectedEvent.id)
          setSelectedEvent({
            ...selectedEvent,
            notifications: eventNotifications.sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          })
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error?.response?.data?.message || 'Không thể xóa tin nhắn!',
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  if (eventsLoading || isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Quản lý Thông báo</h1>
          <p className='text-sm text-gray-600'>Xem và quản lý tin nhắn gửi đến người tham gia</p>
        </div>
      </div>

      {/* Main Content - Messenger Style */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left Sidebar - Event List */}
        <div className='w-96 bg-white border-r border-gray-200 flex flex-col'>
          {/* Search */}
          <div className='p-4 border-b border-gray-200'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                placeholder='Tìm kiếm sự kiện...'
                className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Stats */}
          <div className='px-4 py-3 bg-gray-50 border-b border-gray-200'>
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-gray-700'>Tổng số:</span>
                <span className='px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs'>
                  {eventsData?.events?.length || 0}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-gray-700'>Đang hiển thị:</span>
                <span className='px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-bold text-xs'>
                  {eventsWithNotifications.length}
                </span>
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className='flex-1 overflow-y-auto'>
            {eventsWithNotifications.length === 0 ? (
              <div className='p-8 text-center'>
                <p className='text-gray-500 font-medium'>Không có sự kiện nào</p>
                <p className='text-gray-400 text-sm mt-1'>
                  {searchEvent ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có sự kiện đang mở đăng ký hoặc đang diễn ra'}
                </p>
              </div>
            ) : (
              eventsWithNotifications.map((event) => {
                const isEnded = event.current_status === 'ENDED'
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      selectedEvent?.id === event.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-gray-900 truncate'>{event.title}</h3>
                          {isEnded && (
                            <span className='px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'>
                              Đã kết thúc
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-xs text-gray-500'>{event.notifications.length} tin nhắn</span>
                          {event.notifications.length > 0 && (
                            <>
                              <span className='text-gray-300'>•</span>
                              <span className='text-xs text-gray-500'>
                                {format(
                                  new Date(event.notifications[event.notifications.length - 1].created_at),
                                  'dd/MM HH:mm',
                                  { locale: vi }
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className='flex-1 flex flex-col'>
          {selectedEvent ? (
            <>
              {/* Chat Header */}
              <div className='bg-white border-b border-gray-200 px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-lg font-bold text-gray-900'>{selectedEvent.title}</h2>
                      {selectedEvent.current_status === 'ENDED' && (
                        <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>Đã kết thúc</span>
                      )}
                    </div>
                    <p className='text-sm text-gray-600 mt-0.5'>{selectedEvent.notifications.length} tin nhắn</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
                {selectedEvent.notifications.length === 0 ? (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                      <p className='text-gray-500 font-medium'>Chưa có tin nhắn nào</p>
                      <p className='text-gray-400 text-sm mt-1'>
                        {selectedEvent.current_status === 'ENDED'
                          ? 'Sự kiện đã kết thúc'
                          : 'Gửi tin nhắn đầu tiên cho người tham gia'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {selectedEvent.notifications.map((notification) => {
                      const isEnded = selectedEvent.current_status === 'ENDED'
                      return (
                        <div key={notification.id} className='group'>
                          <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
                            <p className='text-gray-800 whitespace-pre-wrap'>{notification.message}</p>
                            <div className='flex items-center justify-between mt-3'>
                              <span className='text-xs text-gray-500'>
                                {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </span>
                              {!isEnded && (
                                <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <button
                                    onClick={() => setEditingNotification(notification)}
                                    className='p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all'
                                    title='Sửa tin nhắn'
                                  >
                                    <Edit className='w-4 h-4' />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className='p-1.5 text-red-600 hover:bg-red-50 rounded transition-all'
                                    title='Xóa tin nhắn'
                                  >
                                    <Trash2 className='w-4 h-4' />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input - Only show if event is not ended */}
              {selectedEvent.current_status !== 'ENDED' && (
                <div className='bg-white border-t border-gray-200 p-4'>
                  <div className='flex gap-3'>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder='Nhập tin nhắn gửi đến người tham gia...'
                      rows={3}
                      className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !message.trim()}
                      className='px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium'
                    >
                      {sending ? (
                        <>
                          <Loader2 className='w-5 h-5 animate-spin' />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className='w-5 h-5' />
                          Gửi
                        </>
                      )}
                    </button>
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>
                    Nhấn <kbd className='px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs'>Enter</kbd> để
                    gửi,{' '}
                    <kbd className='px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs'>Shift+Enter</kbd> để
                    xuống dòng
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className='flex items-center justify-center h-full bg-gray-50'>
              <div className='text-center'>
                <p className='text-gray-500 text-lg font-medium'>Chọn một sự kiện để bắt đầu</p>
                <p className='text-gray-400 text-sm mt-1'>Chọn sự kiện từ danh sách bên trái để xem và gửi tin nhắn</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Notification Modal */}
      {editingNotification && selectedEvent && (
        <EditNotificationModal
          notification={editingNotification}
          eventTitle={selectedEvent.title}
          onClose={() => setEditingNotification(null)}
          onSuccess={() => {
            fetchNotifications()
            setEditingNotification(null)
          }}
        />
      )}
    </div>
  )
}
