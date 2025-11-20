import { useMemo, useState, useCallback, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import type { Event as CalendarEvent, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { X } from 'lucide-react'
import type { Registration } from '../../types/registration.types'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'

const localizer = momentLocalizer(moment)

interface CustomCalendarEvent extends CalendarEvent {
  title: string
  start: Date
  end: Date
  resource: {
    id: string
    status: string
    registrationStatus: string
    location: string
  }
}

interface MyEventsCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  registrations: Registration[]
  refetch?: () => void
}

export default function MyEventsCalendarModal({ isOpen, onClose, registrations, refetch }: MyEventsCalendarModalProps) {
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Refetch data khi modal được mở
  useEffect(() => {
    if (isOpen && refetch) {
      refetch()
    }
  }, [isOpen, refetch])

  const calendarEvents: CustomCalendarEvent[] = useMemo(() => {
    return registrations
      .filter((reg) => {
        // Chỉ lấy events:
        // 1. Chưa hủy đăng ký (current_status !== CANCELLED)
        // 2. Sự kiện chưa bị hủy (event.current_status !== CANCELLED)
        // → Bao gồm: CONFIRMED, WAITING (đăng ký) + UPCOMING, ONGOING, COMPLETED (sự kiện)
        const registrationStatus = reg.current_status
        const eventStatus = reg.event?.current_status
        return reg.event && registrationStatus !== 'CANCELLED' && eventStatus !== 'CANCELLED'
      })
      .map((reg: Registration) => ({
        title: reg.event!.title,
        start: new Date(reg.event!.start_date),
        end: new Date(reg.event!.end_date),
        resource: {
          id: reg.event!.id,
          status: reg.event!.current_status || 'UPCOMING',
          registrationStatus: reg.current_status || 'REGISTERED',
          location: reg.event!.location?.name || 'Chưa xác định'
        }
      }))
  }, [registrations])

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView)
  }, [])

  const eventStyleGetter = (event: CustomCalendarEvent) => {
    const { status, registrationStatus } = event.resource

    let backgroundColor = '#3b82f6' // Default blue
    let borderColor = '#2563eb'

    // Color by event status
    if (status === 'UPCOMING') {
      backgroundColor = '#3b82f6' // Blue
      borderColor = '#2563eb'
    } else if (status === 'ONGOING') {
      backgroundColor = '#10b981' // Green
      borderColor = '#059669'
    } else if (status === 'COMPLETED') {
      backgroundColor = '#6b7280' // Gray
      borderColor = '#4b5563'
    } else if (status === 'CANCELLED') {
      backgroundColor = '#dc2626' // Red
      borderColor = '#b91c1c'
    }

    // Adjust for registration status
    if (registrationStatus === 'WAITING') {
      backgroundColor = '#f59e0b' // Orange for waiting list
      borderColor = '#d97706'
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '6px',
        color: 'white',
        padding: '4px 8px',
        fontSize: '13px',
        fontWeight: '500'
      }
    }
  }

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

  const statusLabels: Record<string, string> = {
    UPCOMING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    COMPLETED: 'Đã kết thúc',
    CANCELLED: 'Đã hủy'
  }

  const registrationStatusLabels: Record<string, string> = {
    REGISTERED: 'Đã đăng ký',
    WAITING: 'Danh sách chờ',
    CANCELLED: 'Đã hủy'
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Lịch sự kiện của tôi</h2>
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

        {/* Legend */}
        <div className='px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-blue-600 rounded'></div>
            <span className='text-gray-700'>Đã đăng ký</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-green-600 rounded'></div>
            <span className='text-gray-700'>Đang diễn ra</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-gray-600 rounded'></div>
            <span className='text-gray-700'>Đã kết thúc</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-orange-600 rounded'></div>
            <span className='text-gray-700'>Danh sách chờ</span>
          </div>
        </div>

        {/* Calendar */}
        <div className='flex-1 p-6 overflow-auto'>
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
              Swal.fire({
                title: event.title,
                html: `
                  <div class="text-left space-y-2">
                    <p><strong>Trạng thái sự kiện:</strong> ${statusLabels[event.resource.status] || event.resource.status}</p>
                    <p><strong>Trạng thái đăng ký:</strong> ${registrationStatusLabels[event.resource.registrationStatus] || event.resource.registrationStatus}</p>
                    <p><strong>Địa điểm:</strong> ${event.resource.location}</p>
                    <p><strong>Thời gian:</strong> ${moment(event.start).format('DD/MM/YYYY HH:mm')} - ${moment(event.end).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Xem chi tiết',
                cancelButtonText: 'Đóng',
                confirmButtonColor: '#3b82f6'
              }).then((result) => {
                if (result.isConfirmed) {
                  onClose() // Đóng modal trước
                  navigate(`/events/${event.resource.id}`)
                }
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
