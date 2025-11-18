import { useQuery } from '@apollo/client/react'
import { MapPin, Users, Clock, Tag, Search, Calendar as CalendarIcon, XCircle } from 'lucide-react'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'
import config from '../../../constants/config'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { EventsData } from '../../../types/event.types'

export default function Events() {
  const navigate = useNavigate()
  const { loading, error, data } = useQuery<EventsData>(GET_ALL_EVENTS)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [upcomingPage, setUpcomingPage] = useState<number>(1)
  const eventsPerPage = 6

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

  // Hàm lọc chung cho cả UPCOMING và OPEN events
  const applyFilters = (eventsList: typeof events) => {
    return eventsList.filter((event) => {
      const matchTitle = event.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStartDate = !filterStartDate || new Date(event.start_date) >= new Date(filterStartDate)
      const matchEndDate = !filterEndDate || new Date(event.start_date) <= new Date(filterEndDate)
      return matchTitle && matchStartDate && matchEndDate
    })
  }

  // Lấy events sắp diễn ra (UPCOMING) - CHỈ HIỂN THỊ ĐÃ DUYỆT và áp dụng bộ lọc
  const upcomingEvents = applyFilters(
    events.filter((event) => event.current_status === 'UPCOMING' && event.current_approval_status === 'APPROVED')
  )

  // Lấy events đang mở đăng ký (OPEN) - CHỈ HIỂN THỊ ĐÃ DUYỆT và áp dụng bộ lọc
  const openEvents = applyFilters(
    events.filter((event) => event.current_status === 'OPEN' && event.current_approval_status === 'APPROVED')
  )

  // Sử dụng openEvents làm filteredEvents cho phần hiển thị chính
  const filteredEvents = openEvents

  // Phân trang cho Upcoming Events
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / eventsPerPage)
  const upcomingIndexOfLast = upcomingPage * eventsPerPage
  const upcomingIndexOfFirst = upcomingIndexOfLast - eventsPerPage
  const currentUpcomingEvents = upcomingEvents.slice(upcomingIndexOfFirst, upcomingIndexOfLast)

  // Phân trang cho Open Events
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)

  // Reset về trang 1 khi search thay đổi
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    setUpcomingPage(1)
  }

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
              <p className='text-white/90 text-lg md:text-xl max-w-3xl mx-auto'>
                Khám phá các sự kiện học thuật và hội thảo chuyên môn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Dưới ảnh header */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='bg-white rounded-2xl shadow-sm p-8 border border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Tìm kiếm theo tên */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-2'>Tìm kiếm sự kiện</label>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Nhập tên sự kiện...'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 transition-all hover:bg-white'
                />
              </div>
            </div>

            {/* Lọc theo ngày bắt đầu */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-2'>Từ ngày</label>
              <div className='relative'>
                <CalendarIcon className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                <input
                  type='date'
                  value={filterStartDate}
                  onChange={(e) => {
                    setFilterStartDate(e.target.value)
                    setCurrentPage(1)
                    setUpcomingPage(1)
                  }}
                  className='w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 transition-all hover:bg-white'
                />
              </div>
            </div>

            {/* Đến ngày + Nút xóa bộ lọc */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-2'>Đến ngày</label>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <CalendarIcon className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                  <input
                    type='date'
                    value={filterEndDate}
                    onChange={(e) => {
                      setFilterEndDate(e.target.value)
                      setCurrentPage(1)
                      setUpcomingPage(1)
                    }}
                    className='w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 transition-all hover:bg-white'
                  />
                </div>

                {/* Nút xóa bộ lọc */}
                {(searchQuery || filterStartDate || filterEndDate) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStartDate('')
                      setFilterEndDate('')
                      setCurrentPage(1)
                      setUpcomingPage(1)
                    }}
                    className='px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap'
                    title='Xóa bộ lọc'
                  >
                    <XCircle className='w-4 h-4' />
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <div className='max-w-7xl mx-auto px-6 pb-8'>
          <div className='mb-6'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <CalendarIcon className='w-8 h-8 text-blue-600' />
              Sự kiện sắp diễn ra
            </h2>
            <p className='text-gray-600'>Các sự kiện sẽ mở đăng ký trong thời gian tới</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {currentUpcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className='group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border-2 border-blue-100'
              >
                {/* Image */}
                <div className='relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100'>
                  {event.image_url ? (
                    <img
                      src={`${config.baseUrl}${event.image_url}`}
                      alt={event.title}
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-6xl'>🎓</div>
                  )}

                  {/* Status Badge */}
                  <div className='absolute top-3 right-3'>
                    <span className='px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-blue-500/90 text-white'>
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

                  <div className='space-y-2 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <Clock className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{formatTime(event.start_date)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{event.location?.name || 'Chưa xác định'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Users className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span>Sức chứa: {event.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Upcoming Events */}
          {upcomingTotalPages > 1 && (
            <div className='flex justify-center items-center gap-2 mt-8'>
              <button
                onClick={() => setUpcomingPage((prev) => Math.max(prev - 1, 1))}
                disabled={upcomingPage === 1}
                className='px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              >
                ← Trước
              </button>

              <div className='flex gap-2'>
                {Array.from({ length: upcomingTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setUpcomingPage(page)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      upcomingPage === page
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setUpcomingPage((prev) => Math.min(prev + 1, upcomingTotalPages))}
                disabled={upcomingPage === upcomingTotalPages}
                className='px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      {upcomingEvents.length > 0 && (
        <div className='max-w-7xl mx-auto px-6 pb-8'>
          <div className='border-t-2 border-gray-200'></div>
        </div>
      )}

      {/* Open Events Section */}
      <div className='max-w-7xl mx-auto px-6 pb-12'>
        <div className='mb-6'>
          <h2 className='text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
            <CalendarIcon className='w-8 h-8 text-green-600' />
            Sự kiện đang mở đăng ký
          </h2>
          <p className='text-gray-600'>Đăng ký ngay để tham gia các sự kiện thú vị</p>
        </div>
        {filteredEvents.length === 0 ? (
          <div className='text-center py-24'>
            <div className='text-gray-300 text-6xl mb-4'>📅</div>
            <h3 className='text-lg font-medium text-gray-900 mb-1'>Không tìm thấy sự kiện</h3>
            <p className='text-gray-500 text-sm'>Thử từ khóa tìm kiếm khác</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {currentEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className='group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1'
                >
                  {/* Image */}
                  <div className='relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100'>
                    {event.image_url ? (
                      <img
                        src={`${config.baseUrl}${event.image_url}`}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center items-center gap-2 mt-12'>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                  ← Trước
                </button>

                <div className='flex gap-2'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
