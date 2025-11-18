import { useMemo, useState, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import type { Event as CalendarEvent, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'
import { X } from 'lucide-react'
import type { Event } from '../../../types/event.types'
import Swal from 'sweetalert2'

// Set Vietnamese locale for moment
moment.locale('vi', {
  months: 'Tháng 1_Tháng 2_Tháng 3_Tháng 4_Tháng 5_Tháng 6_Tháng 7_Tháng 8_Tháng 9_Tháng 10_Tháng 11_Tháng 12'.split(
    '_'
  ),
  monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
  weekdays: 'Chủ nhật_Thứ hai_Thứ ba_Thứ tư_Thứ năm_Thứ sáu_Thứ bảy'.split('_'),
  weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
  weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM [năm] YYYY',
    LLL: 'D MMMM [năm] YYYY HH:mm',
    LLLL: 'dddd, D MMMM [năm] YYYY HH:mm'
  },
  calendar: {
    sameDay: '[Hôm nay lúc] LT',
    nextDay: '[Ngày mai lúc] LT',
    nextWeek: 'dddd [tuần tới lúc] LT',
    lastDay: '[Hôm qua lúc] LT',
    lastWeek: 'dddd [tuần trước lúc] LT',
    sameElse: 'L'
  },
  relativeTime: {
    future: '%s tới',
    past: '%s trước',
    s: 'vài giây',
    m: 'một phút',
    mm: '%d phút',
    h: 'một giờ',
    hh: '%d giờ',
    d: 'một ngày',
    dd: '%d ngày',
    M: 'một tháng',
    MM: '%d tháng',
    y: 'một năm',
    yy: '%d năm'
  },
  ordinal: (number: number) => `${number}`,
  week: {
    dow: 1,
    doy: 4
  }
})

const localizer = momentLocalizer(moment)

interface LocationCalendarModalProps {
  locationId: string
  locationName: string
  onClose: () => void
}

interface EventsData {
  events: Event[]
}

// Custom event type for calendar
interface CustomCalendarEvent extends CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    status: string
    approvalStatus: string
    organizer: string
    capacity: number
  }
}

export default function LocationCalendarModal({ locationId, locationName, onClose }: LocationCalendarModalProps) {
  const { data, loading } = useQuery<EventsData>(GET_ALL_EVENTS)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>('month')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Filter events by location and transform to calendar format
  const calendarEvents = useMemo<CustomCalendarEvent[]>(() => {
    if (!data?.events) return []

    return data.events
      .filter((event) => event.location.id === locationId)
      .map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        resource: {
          status: event.current_status,
          approvalStatus: event.current_approval_status,
          organizer: event.organizer,
          capacity: event.capacity
        }
      }))
  }, [data, locationId])

  // Custom event style based on status
  const eventStyleGetter = (event: CustomCalendarEvent) => {
    let backgroundColor = '#3174ad'
    let borderColor = '#265985'

    switch (event.resource.status) {
      case 'UPCOMING':
        backgroundColor = '#3b82f6' // Blue
        borderColor = '#2563eb'
        break
      case 'OPEN':
        backgroundColor = '#10b981' // Green
        borderColor = '#059669'
        break
      case 'ONGOING':
        backgroundColor = '#f59e0b' // Orange
        borderColor = '#d97706'
        break
      case 'ENDED':
        backgroundColor = '#6b7280' // Gray
        borderColor = '#4b5563'
        break
      case 'CANCELLED':
        backgroundColor = '#ef4444' // Red
        borderColor = '#dc2626'
        break
    }

    // If not approved, make it lighter
    if (event.resource.approvalStatus !== 'APPROVED') {
      backgroundColor = backgroundColor + '80' // Add transparency
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '500'
      }
    }
  }

  // Handlers for navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView)
  }, [])

  // Function to jump to first event of a specific status
  const jumpToStatus = useCallback(
    (status: string) => {
      const eventsWithStatus = calendarEvents.filter((event) => event.resource.status === status)

      if (eventsWithStatus.length > 0) {
        // Sort by start date and get the first one
        const sortedEvents = eventsWithStatus.sort((a, b) => a.start.getTime() - b.start.getTime())
        const firstEvent = sortedEvents[0]

        // Navigate to that date
        setCurrentDate(firstEvent.start)
        setSelectedStatus(status)
      }
    },
    [calendarEvents]
  )

  // Custom messages in Vietnamese
  const messages = {
    allDay: 'Cả ngày',
    previous: 'Trước',
    next: 'Sau',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch trình',
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này',
    showMore: (total: number) => `+ Xem thêm ${total} sự kiện`
  }

  return (
    <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Lịch sử kiện - {locationName}</h2>
            <p className='text-blue-100 mt-1'>Tổng số sự kiện: {calendarEvents.length}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors'
            title='Đóng'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Legend - Clickable filters */}
        <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
          <div className='flex flex-wrap gap-3 text-sm'>
            <button
              onClick={() => jumpToStatus('UPCOMING')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white hover:shadow-md ${
                selectedStatus === 'UPCOMING' ? 'bg-white shadow-md ring-2 ring-blue-500' : ''
              }`}
              title='Click để nhảy đến sự kiện sắp diễn ra'
            >
              <div className='w-4 h-4 rounded' style={{ backgroundColor: '#3b82f6' }}></div>
              <span className='font-medium text-gray-700'>Sắp diễn ra</span>
            </button>
            <button
              onClick={() => jumpToStatus('OPEN')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white hover:shadow-md ${
                selectedStatus === 'OPEN' ? 'bg-white shadow-md ring-2 ring-green-500' : ''
              }`}
              title='Click để nhảy đến sự kiện đang mở đăng ký'
            >
              <div className='w-4 h-4 rounded' style={{ backgroundColor: '#10b981' }}></div>
              <span className='font-medium text-gray-700'>Đang mở đăng ký</span>
            </button>
            <button
              onClick={() => jumpToStatus('ONGOING')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white hover:shadow-md ${
                selectedStatus === 'ONGOING' ? 'bg-white shadow-md ring-2 ring-orange-500' : ''
              }`}
              title='Click để nhảy đến sự kiện đang diễn ra'
            >
              <div className='w-4 h-4 rounded' style={{ backgroundColor: '#f59e0b' }}></div>
              <span className='font-medium text-gray-700'>Đang diễn ra</span>
            </button>
            <button
              onClick={() => jumpToStatus('ENDED')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white hover:shadow-md ${
                selectedStatus === 'ENDED' ? 'bg-white shadow-md ring-2 ring-gray-500' : ''
              }`}
              title='Click để nhảy đến sự kiện đã kết thúc'
            >
              <div className='w-4 h-4 rounded' style={{ backgroundColor: '#6b7280' }}></div>
              <span className='font-medium text-gray-700'>Đã kết thúc</span>
            </button>
            <button
              onClick={() => jumpToStatus('CANCELLED')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white hover:shadow-md ${
                selectedStatus === 'CANCELLED' ? 'bg-white shadow-md ring-2 ring-red-500' : ''
              }`}
              title='Click để nhảy đến sự kiện đã hủy'
            >
              <div className='w-4 h-4 rounded' style={{ backgroundColor: '#ef4444' }}></div>
              <span className='font-medium text-gray-700'>Đã hủy</span>
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className='flex-1 p-6 overflow-auto'>
          {loading ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-4 text-gray-600'>Đang tải lịch sự kiện...</p>
              </div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor='start'
              endAccessor='end'
              style={{ height: 600 }}
              messages={messages}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              view={currentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              popup
              selectable
              onSelectEvent={(event: CustomCalendarEvent) => {
                // Show event details with SweetAlert2
                const statusLabels: Record<string, string> = {
                  UPCOMING: 'Sắp diễn ra',
                  OPEN: 'Đang mở đăng ký',
                  ONGOING: 'Đang diễn ra',
                  ENDED: 'Đã kết thúc',
                  CANCELLED: 'Đã hủy'
                }

                const approvalLabels: Record<string, string> = {
                  APPROVED: 'Đã duyệt',
                  PENDING: 'Chờ duyệt',
                  REJECTED: 'Từ chối'
                }

                Swal.fire({
                  title: event.title,
                  html: `
                    <div class="text-left space-y-2">
                      <p><strong>Trạng thái:</strong> ${statusLabels[event.resource.status] || event.resource.status}</p>
                      <p><strong>Phê duyệt:</strong> ${approvalLabels[event.resource.approvalStatus] || event.resource.approvalStatus}</p>
                      <p><strong>Ban tổ chức:</strong> ${event.resource.organizer}</p>
                      <p><strong>Sức chứa:</strong> ${event.resource.capacity} người</p>
                      <p><strong>Thời gian:</strong> ${moment(event.start).format('DD/MM/YYYY HH:mm')} - ${moment(event.end).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                  `,
                  icon: 'info',
                  confirmButtonText: 'Đóng',
                  confirmButtonColor: '#3b82f6'
                })
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
