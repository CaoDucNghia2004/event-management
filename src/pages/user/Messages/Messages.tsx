import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_REGISTRATIONS_BY_USER } from '../../../graphql/queries/registrationQueries'
import { useAuthStore } from '../../../store/useAuthStore'
import { getUserIdFromToken } from '../../../utils/utils'
import { MessageSquare, Calendar, Loader2, Search } from 'lucide-react'
import NotificationList from '../../../components/NotificationList'
import type { RegistrationsByUserData, Registration } from '../../../types/registration.types'
import type { Notification } from '../../../types/notification.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import config from '../../../constants/config'
import notificationApiRequests from '../../../apiRequests/notification'

export default function Messages() {
  const { user } = useAuthStore()
  const userId = getUserIdFromToken()
  const [selectedEvent, setSelectedEvent] = useState<Registration['event'] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])

  const { loading, data } = useQuery<RegistrationsByUserData>(GET_REGISTRATIONS_BY_USER, {
    variables: { user_id: userId },
    skip: !userId,
    fetchPolicy: 'network-only'
  })

  // Fetch all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationApiRequests.getAll()
        const notificationsData = response.data.data.data || response.data.data || []
        setNotifications(notificationsData)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }
    fetchNotifications()
  }, [])

  const registrations = data?.registrationsByUser || []

  // Lọc chỉ lấy các sự kiện đã CONFIRMED (đã đăng ký thành công)
  // VÀ chỉ hiển thị sự kiện OPEN, ONGOING
  // HOẶC ENDED nếu có tin nhắn
  const confirmedRegistrations = registrations.filter((reg) => {
    if (reg.current_status !== 'CONFIRMED' || !reg.event) return false

    const event = reg.event
    const eventStatus = event.current_status

    // Luôn hiển thị OPEN và ONGOING
    if (eventStatus === 'OPEN' || eventStatus === 'ONGOING') return true

    // Với ENDED: chỉ hiển thị nếu có tin nhắn
    if (eventStatus === 'ENDED') {
      const hasMessages = notifications.some((n) => n.event_id === event.id)
      return hasMessages
    }

    return false
  })

  // Filter events by search query
  const filteredRegistrations = confirmedRegistrations.filter((reg) => {
    if (!searchQuery) return true
    const event = reg.event
    if (!event) return false
    return event.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <MessageSquare className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Vui lòng đăng nhập</h2>
          <p className='text-gray-500'>Bạn cần đăng nhập để xem tin nhắn</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='max-w-7xl mx-auto flex items-center gap-3'>
          <MessageSquare className='w-7 h-7 text-blue-600' />
          <h1 className='text-2xl font-bold text-gray-900'>Tin nhắn</h1>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className='max-w-7xl mx-auto h-[calc(100vh-80px)]'>
        <div className='flex h-full'>
          {/* LEFT SIDEBAR - Event List (như danh sách chat) */}
          <div className='w-96 bg-white border-r border-gray-200 flex flex-col'>
            {/* Search Bar */}
            <div className='p-4 border-b border-gray-200'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Tìm kiếm sự kiện...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Event List */}
            <div className='flex-1 overflow-y-auto custom-scrollbar'>
              {loading && (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
                </div>
              )}

              {!loading && confirmedRegistrations.length === 0 && (
                <div className='p-8 text-center'>
                  <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-sm font-semibold text-gray-900 mb-1'>Chưa có sự kiện</h3>
                  <p className='text-xs text-gray-500'>Đăng ký sự kiện để nhận tin nhắn</p>
                </div>
              )}

              {!loading &&
                filteredRegistrations.map((registration) => {
                  const event = registration.event
                  if (!event) return null

                  const isSelected = selectedEvent?.id === event.id

                  return (
                    <button
                      key={registration.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''
                      }`}
                    >
                      {/* Event Image/Icon */}
                      <div className='flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center'>
                        {event.image_url ? (
                          <img
                            src={`${config.baseUrl}${event.image_url}`}
                            alt={event.title}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <Calendar className='w-6 h-6 text-blue-600' />
                        )}
                      </div>

                      {/* Event Info */}
                      <div className='flex-1 min-w-0 text-left'>
                        <h3
                          className={`text-sm font-semibold mb-1 truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
                        >
                          {event.title}
                        </h3>
                        <p className='text-xs text-gray-500 truncate'>{event.location?.name || 'N/A'}</p>
                        <div className='flex items-center gap-2 mt-0.5'>
                          <p className='text-xs text-gray-400'>{formatShortDate(event.start_date)}</p>
                          {/* Status Badge */}
                          {event.current_status === 'OPEN' && (
                            <span className='px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium'>
                              Sắp diễn ra
                            </span>
                          )}
                          {event.current_status === 'ONGOING' && (
                            <span className='px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium'>
                              Đang diễn ra
                            </span>
                          )}
                          {event.current_status === 'ENDED' && (
                            <span className='px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium'>
                              Đã kết thúc
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread Badge (optional - có thể thêm sau) */}
                      {isSelected && (
                        <div className='flex-shrink-0'>
                          <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                        </div>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>

          {/* RIGHT PANEL - Chat Area */}
          <div className='flex-1 bg-gray-50 flex flex-col'>
            {!selectedEvent ? (
              // Empty State - Chưa chọn sự kiện
              <div className='flex-1 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4'>
                    <MessageSquare className='w-10 h-10 text-blue-600' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>Chọn một sự kiện</h3>
                  <p className='text-sm text-gray-500'>Chọn sự kiện từ danh sách bên trái để xem tin nhắn</p>
                </div>
              </div>
            ) : (
              // Chat Window - Đã chọn sự kiện
              <>
                {/* Chat Header */}
                <div className='bg-white border-b border-gray-200 px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0'>
                      {selectedEvent.image_url ? (
                        <img
                          src={`${config.baseUrl}${selectedEvent.image_url}`}
                          alt={selectedEvent.title}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <Calendar className='w-5 h-5 text-blue-600' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h2 className='text-lg font-bold text-gray-900 truncate'>{selectedEvent.title}</h2>
                      <p className='text-sm text-gray-500 truncate'>
                        {selectedEvent.location?.name} • {formatShortDate(selectedEvent.start_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className='flex-1 overflow-y-auto p-6'>
                  <NotificationList eventId={selectedEvent.id} enableRealtime={true} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
