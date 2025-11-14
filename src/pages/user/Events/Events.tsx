// export default function Events() {
//   return <div>Events</div>
// }

import { useQuery } from '@apollo/client/react'
import { MapPin, Users, Clock, Tag } from 'lucide-react'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { EventsData } from '../../../types/event.types'

export default function Events() {
  const navigate = useNavigate()
  const { loading, error, data } = useQuery<EventsData>(GET_ALL_EVENTS)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      UPCOMING: 'Sắp diễn ra',
      OPEN: 'Đang mở đăng ký',
      ONGOING: 'Đang diễn ra',
      ENDED: 'Đã kết thúc',
      CANCELLED: 'Đã hủy'
    }
    return texts[status] || status
  }

  const formatDay = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd', { locale: vi })
    } catch {
      return ''
    }
  }

  const formatMonth = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'MMM', { locale: vi })
    } catch {
      return ''
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'HH:mm', { locale: vi })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin'></div>
          <p className='text-gray-500 text-sm'>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <div className='text-red-500 text-5xl mb-4'>⚠</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Không thể tải dữ liệu</h2>
          <p className='text-gray-500 text-sm'>{error.message}</p>
        </div>
      </div>
    )
  }

  const events = data?.events || []

  const filteredEvents =
    filterStatus === 'ALL' ? events : events.filter((event) => event.current_status === filterStatus)

  const statusFilters = [
    { value: 'ALL', label: 'Tất cả', count: events.length },
    { value: 'OPEN', label: 'Đang mở', count: events.filter((e) => e.current_status === 'OPEN').length },
    { value: 'UPCOMING', label: 'Sắp diễn ra', count: events.filter((e) => e.current_status === 'UPCOMING').length },
    { value: 'ONGOING', label: 'Đang diễn ra', count: events.filter((e) => e.current_status === 'ONGOING').length },
    { value: 'ENDED', label: 'Đã kết thúc', count: events.filter((e) => e.current_status === 'ENDED').length }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'>
      {/* Hero Header (uses public/HUIT2.jpg) */}
      <div
        className='relative bg-cover bg-center text-white overflow-hidden'
        style={{ backgroundImage: `url("/HUIT4.jpg")` }}
      >
        {/* Dark overlay for better contrast */}
        <div className='absolute inset-0 bg-black/55'></div>
        {/* Subtle pattern overlay */}
        <div className='absolute inset-0 bg-[url("/grid.svg")] opacity-8 mix-blend-overlay'></div>

        <div className='relative max-w-7xl mx-auto px-6 py-28 md:py-36 min-h-[420px] md:min-h-[520px] flex items-center justify-center'>
          {/* Nền đen nhạt bọc content */}
          <div className='bg-black/40 backdrop-blur-md rounded-3xl px-8 md:px-16 py-12 md:py-16 shadow-2xl border border-white/10'>
            <div className='w-full text-center'>
              <h1 className='text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 font-heading tracking-tight'>
                Sự kiện &amp; Hội thảo
              </h1>
              <p className='text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8'>
                Khám phá các sự kiện học thuật và hội thảo chuyên môn
              </p>

              {/* Filter Tabs */}
              <div className='flex flex-wrap justify-center gap-3'>
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                      filterStatus === filter.value
                        ? 'bg-white text-blue-700 shadow-lg scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    {filter.label}
                    <span className='ml-2 text-sm opacity-75'>({filter.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className='max-w-7xl mx-auto px-6 py-12'>
        {filteredEvents.length === 0 ? (
          <div className='text-center py-24'>
            <div className='text-gray-300 text-6xl mb-4'>📅</div>
            <h3 className='text-lg font-medium text-gray-900 mb-1'>Không tìm thấy sự kiện</h3>
            <p className='text-gray-500 text-sm'>Thử chọn bộ lọc khác</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className='group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1'
              >
                {/* Image */}
                <div className='relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100'>
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-6xl'>🎓</div>
                  )}

                  {/* Status Badge */}
                  <div className='absolute top-3 right-3'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        event.current_status === 'OPEN'
                          ? 'bg-green-500/90 text-white'
                          : event.current_status === 'UPCOMING'
                            ? 'bg-blue-500/90 text-white'
                            : event.current_status === 'ONGOING'
                              ? 'bg-orange-500/90 text-white'
                              : 'bg-gray-500/90 text-white'
                      }`}
                    >
                      {getStatusText(event.current_status)}
                    </span>
                  </div>

                  {/* Date Badge */}
                  <div className='absolute bottom-3 left-3 bg-white rounded-lg shadow-lg p-2 text-center min-w-[60px]'>
                    <div className='text-2xl font-bold text-gray-900'>{formatDay(event.start_date)}</div>
                    <div className='text-xs text-gray-500 uppercase font-medium'>{formatMonth(event.start_date)}</div>
                  </div>
                </div>

                {/* Content */}
                <div className='p-5'>
                  <div className='mb-3'>
                    {event.topic && (
                      <div className='flex items-center gap-1.5 text-blue-600 mb-2'>
                        <Tag className='w-3.5 h-3.5' />
                        <span className='text-xs font-medium'>{event.topic}</span>
                      </div>
                    )}
                    <h3 className='text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[56px]'>
                      {event.title}
                    </h3>
                  </div>

                  {event.description && (
                    <p className='text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]'>{event.description}</p>
                  )}

                  <div className='space-y-2 text-sm text-gray-600 mb-4'>
                    <div className='flex items-center gap-2'>
                      <Clock className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{formatTime(event.start_date)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{event.location.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Users className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span>
                        {event.capacity} chỗ{event.waiting_capacity && ` (+${event.waiting_capacity})`}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className='pt-4 border-t border-gray-100'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500 truncate'>{event.organizer}</span>
                      <span className='text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:translate-x-1 transition-transform'>
                        Chi tiết →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
