import { useState, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_FEEDBACKS } from '../../../graphql/queries/feedbackQueries'

import type { FeedbacksData, Feedback } from '../../../types/feedback.types'
import { MessageSquare, Star, Search, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuthStore } from '../../../store/useAuthStore'

// Interface cho nhóm feedback theo sự kiện
interface EventFeedbackGroup {
  eventId: string
  eventTitle: string
  feedbacks: Feedback[]
  averageRating: number
}

export default function ManageFeedbacks() {
  const [searchEvent, setSearchEvent] = useState('')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  // Lấy thông tin user để kiểm tra role
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes('ADMIN')
  const userEmail = user?.email

  const { loading, error, data, refetch } = useQuery<FeedbacksData>(GET_FEEDBACKS, {
    fetchPolicy: 'network-only'
  })

  // Toggle expand/collapse event
  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // Group feedbacks by event
  const groupedFeedbacks = useMemo(() => {
    let feedbacks = data?.feedbacks || []

    // Lọc theo role: ADMIN xem tất cả, ORGANIZER chỉ xem feedbacks của events họ tạo
    feedbacks = feedbacks.filter((fb) => {
      return isAdmin || fb.event?.created_by === userEmail
    })

    // Filter by rating first
    if (filterRating !== 'all') {
      feedbacks = feedbacks.filter((fb) => fb.rating === filterRating)
    }

    // Group by event
    const groups = new Map<string, EventFeedbackGroup>()

    feedbacks.forEach((feedback) => {
      const eventId = feedback.event?.id || 'unknown'
      const eventTitle = feedback.event?.title || 'Không xác định'

      if (!groups.has(eventId)) {
        groups.set(eventId, {
          eventId,
          eventTitle,
          feedbacks: [],
          averageRating: 0
        })
      }

      groups.get(eventId)!.feedbacks.push(feedback)
    })

    // Calculate average rating and sort feedbacks within each group
    const result = Array.from(groups.values()).map((group) => {
      // Sort feedbacks by created_at (newest first)
      group.feedbacks.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })

      // Calculate average rating
      const totalRating = group.feedbacks.reduce((sum, fb) => sum + fb.rating, 0)
      group.averageRating = totalRating / group.feedbacks.length

      return group
    })

    // Filter by search event
    let filteredResult = result
    if (searchEvent) {
      filteredResult = result.filter((group) => group.eventTitle.toLowerCase().includes(searchEvent.toLowerCase()))
    }

    // Sort groups by latest feedback time (newest first)
    return filteredResult.sort((a, b) => {
      const aLatest = a.feedbacks[0]?.created_at || '' // feedbacks đã sort mới nhất trước
      const bLatest = b.feedbacks[0]?.created_at || ''
      return new Date(bLatest).getTime() - new Date(aLatest).getTime()
    })
  }, [data?.feedbacks, searchEvent, filterRating, isAdmin, userEmail])

  // Calculate total feedbacks
  const totalFeedbacks = groupedFeedbacks.reduce((sum, group) => sum + group.feedbacks.length, 0)

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <p className='text-red-600 text-xl font-semibold'>Lỗi: {error.message}</p>
          <button onClick={() => refetch()} className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg'>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
          <MessageSquare className='w-8 h-8 text-orange-600' />
          Quản lý Feedback
        </h1>
        <p className='text-gray-600 mt-1'>Xem và quản lý phản hồi từ người dùng</p>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Search by event */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Search className='w-4 h-4 inline mr-2' />
              Tìm kiếm theo sự kiện
            </label>
            <input
              type='text'
              value={searchEvent}
              onChange={(e) => setSearchEvent(e.target.value)}
              placeholder='Nhập tên sự kiện...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Filter by rating */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Filter className='w-4 h-4 inline mr-2' />
              Lọc theo đánh giá
            </label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='all'>Tất cả</option>
              <option value='5'>⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value='4'>⭐⭐⭐⭐ (4 sao)</option>
              <option value='3'>⭐⭐⭐ (3 sao)</option>
              <option value='2'>⭐⭐ (2 sao)</option>
              <option value='1'>⭐ (1 sao)</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className='mt-4 flex items-center gap-6 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-gray-700'>Tổng số feedback:</span>
            <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold'>
              {groupedFeedbacks.reduce((sum, group) => sum + group.feedbacks.length, 0)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-gray-700'>Số sự kiện:</span>
            <span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold'>
              {groupedFeedbacks.length}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-gray-700'>Đang hiển thị:</span>
            <span className='px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-bold'>{totalFeedbacks}</span>
          </div>
        </div>
      </div>

      {/* Event Groups - Accordion View */}
      <div className='space-y-4'>
        {groupedFeedbacks.length === 0 ? (
          <div className='bg-white rounded-lg shadow-md p-12 text-center'>
            <MessageSquare className='w-16 h-16 mx-auto text-gray-300 mb-4' />
            <p className='text-gray-500 text-lg font-medium'>Không có feedback nào</p>
            <p className='text-gray-400 text-sm mt-1'>
              {searchEvent || filterRating !== 'all'
                ? 'Thử thay đổi bộ lọc để xem kết quả khác'
                : 'Chưa có sinh viên nào gửi đánh giá'}
            </p>
          </div>
        ) : (
          groupedFeedbacks.map((group) => {
            const isExpanded = expandedEvents.has(group.eventId)

            return (
              <div key={group.eventId} className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-200'>
                {/* Event Header - Clickable */}
                <button
                  onClick={() => toggleEvent(group.eventId)}
                  className='w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div className='text-left'>
                      <h3 className='text-lg font-bold text-gray-900'>{group.eventTitle}</h3>
                      <div className='flex items-center gap-4 mt-1'>
                        <span className='text-sm text-gray-600'>
                          <span className='font-semibold'>{group.feedbacks.length}</span> feedback
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-gray-600'>Trung bình:</span>
                          {renderStars(Math.round(group.averageRating), 'sm')}
                          <span className='text-sm font-semibold text-yellow-600'>
                            {group.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-sm'>
                      {group.feedbacks.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className='w-6 h-6 text-gray-400' />
                    ) : (
                      <ChevronDown className='w-6 h-6 text-gray-400' />
                    )}
                  </div>
                </button>

                {/* Feedbacks List - Collapsible */}
                {isExpanded && (
                  <div className='border-t border-gray-200'>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='bg-gray-50'>
                          <tr>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              STT
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Sinh viên
                            </th>
                            <th className='px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Đánh giá
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Nhận xét
                            </th>
                            <th className='px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Ngày gửi
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200 bg-white'>
                          {group.feedbacks.map((feedback, index) => (
                            <tr key={feedback.id} className='hover:bg-orange-50/30 transition-colors'>
                              <td className='px-6 py-4 text-sm font-medium text-gray-900'>{index + 1}</td>
                              <td className='px-6 py-4'>
                                <div className='flex flex-col'>
                                  <span className='text-sm font-semibold text-gray-900'>
                                    {feedback.registration?.user?.name || 'N/A'}
                                  </span>
                                  <span className='text-xs text-gray-500'>
                                    {feedback.registration?.user?.email || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex justify-center'>{renderStars(feedback.rating)}</div>
                              </td>
                              <td className='px-6 py-4'>
                                {feedback.comments ? (
                                  <div className='max-w-md'>
                                    <p className='text-sm text-gray-700' title={feedback.comments}>
                                      {feedback.comments}
                                    </p>
                                  </div>
                                ) : (
                                  <span className='text-sm text-gray-400 italic'>Không có nhận xét</span>
                                )}
                              </td>
                              <td className='px-6 py-4 text-center'>
                                <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                                  <Calendar className='w-4 h-4' />
                                  {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
