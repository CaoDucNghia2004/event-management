import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'
import { GET_PAPERS } from '../../../graphql/queries/paperQueries'
import { GET_ALL_USERS } from '../../../graphql/queries/userQueries'
import {
  Calendar,
  Users,
  FileText,
  Clock,
  MapPin,
  MessageSquare,
  Bell,
  CalendarClock,
  CalendarCheck,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import type { Event } from '../../../types/event.types'
import type { Paper } from '../../../types/paper.types'
import './Dashboard.css'

// Type definitions for GraphQL responses
interface EventsData {
  events?: Event[]
}

interface PapersData {
  papers?: Paper[]
}

interface UsersData {
  users?: {
    paginatorInfo?: {
      total?: number
    }
  }
}

export default function Dashboard() {
  const { data: eventsData, loading: eventsLoading } = useQuery<EventsData>(GET_ALL_EVENTS)
  const { data: papersData, loading: papersLoading } = useQuery<PapersData>(GET_PAPERS)
  const { data: usersData, loading: usersLoading } = useQuery<UsersData>(GET_ALL_USERS)

  const totalEvents = eventsData?.events?.length || 0
  const totalUsers = usersData?.users?.paginatorInfo?.total || 0
  const totalPapers = papersData?.papers?.length || 0
  const pendingEvents = eventsData?.events?.filter((e: Event) => e.current_approval_status === 'WAITING').length || 0

  // Event status statistics
  const upcomingEvents = eventsData?.events?.filter((e: Event) => e.current_status === 'UPCOMING').length || 0
  const openEvents = eventsData?.events?.filter((e: Event) => e.current_status === 'OPEN').length || 0
  const ongoingEvents = eventsData?.events?.filter((e: Event) => e.current_status === 'ONGOING').length || 0
  const endedEvents = eventsData?.events?.filter((e: Event) => e.current_status === 'ENDED').length || 0

  // Approval status statistics
  const waitingApproval = eventsData?.events?.filter((e: Event) => e.current_approval_status === 'WAITING').length || 0
  const approvedEvents = eventsData?.events?.filter((e: Event) => e.current_approval_status === 'APPROVED').length || 0
  const rejectedEvents = eventsData?.events?.filter((e: Event) => e.current_approval_status === 'REJECTED').length || 0

  const stats = [
    {
      title: 'Tổng sự kiện',
      value: totalEvents,
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      loading: eventsLoading
    },
    {
      title: 'Người dùng',
      value: totalUsers,
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      loading: usersLoading
    },
    {
      title: 'Chờ duyệt',
      value: pendingEvents,
      icon: Clock,
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      loading: eventsLoading
    },
    {
      title: 'Bài báo',
      value: totalPapers,
      icon: FileText,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      loading: papersLoading
    }
  ]

  const managementFeatures = [
    {
      title: 'Quản lý địa điểm',
      description: 'Thêm/sửa địa điểm tổ chức',
      icon: MapPin,
      link: '/admin/locations',
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Quản lý sự kiện',
      description: 'Tạo, sửa, xóa sự kiện',
      icon: Calendar,
      link: '/admin/events',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Quản lý bài báo',
      description: 'Kiểm duyệt bài báo',
      icon: FileText,
      link: '/admin/papers',
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Quản lý người dùng',
      description: 'Xem và quản lý users',
      icon: Users,
      link: '/admin/users',
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Quản lý Feedback',
      description: 'Xem phản hồi từ người dùng',
      icon: MessageSquare,
      link: '/admin/feedbacks',
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Quản lý Thông báo',
      description: 'Gửi thông báo đến người dùng',
      icon: Bell,
      link: '/admin/notifications',
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 px-8 pt-16 pb-8'>
      <div className='max-w-[1400px] mx-auto'>
        {/* Header - Modern & Clean */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-1'>Hello, Admin</h1>
          <p className='text-gray-500 text-sm'>
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Quick Stats - Redesigned */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const colors = [
              { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600' },
              { bg: 'from-teal-500 to-teal-600', light: 'bg-teal-50', text: 'text-teal-600' },
              { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600' },
              { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', text: 'text-pink-600' }
            ]
            const color = colors[index % 4]

            // Calculate percentage based on max value
            const maxValue = Math.max(...stats.map((s) => s.value))
            const percentage = maxValue > 0 ? Math.round((stat.value / maxValue) * 100) : 0

            return (
              <div
                key={index}
                className='group relative bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden'
              >
                <div className='p-6'>
                  {/* Icon & Value Row */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className={`p-3 ${color.light} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${color.text}`} />
                    </div>

                    {stat.loading ? (
                      <div className='h-8 w-16 bg-gray-200 animate-pulse'></div>
                    ) : (
                      <div className='text-right'>
                        <p className='text-3xl font-bold text-gray-900'>{stat.value.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className='text-sm font-medium text-gray-600'>{stat.title}</h3>

                  {/* Progress indicator */}
                  <div className='mt-4'>
                    <div className='h-1 bg-gray-100 overflow-hidden'>
                      <div
                        className={`h-full bg-gradient-to-r ${color.bg} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Management Features */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Quick Actions */}
            <div className='bg-white shadow-sm dashboard-card-p-6'>
              <h2 className='text-lg font-bold text-gray-900 mb-4'>Quản lý nhanh</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {managementFeatures.slice(0, 4).map((feature, index) => {
                  const Icon = feature.icon
                  const colors = [
                    { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'hover:bg-purple-100' },
                    { bg: 'bg-teal-50', icon: 'text-teal-600', hover: 'hover:bg-teal-100' },
                    { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'hover:bg-orange-100' },
                    { bg: 'bg-pink-50', icon: 'text-pink-600', hover: 'hover:bg-pink-100' }
                  ]
                  const color = colors[index % 4]

                  return (
                    <Link
                      key={index}
                      to={feature.link}
                      className={`group flex items-center gap-4 p-4 ${color.bg} ${color.hover} transition-all duration-300 hover:shadow-md`}
                    >
                      <div className='flex-shrink-0'>
                        <Icon className={`w-6 h-6 ${color.icon}`} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-semibold text-gray-900 truncate'>{feature.title}</h3>
                        <p className='text-sm text-gray-600 truncate'>{feature.description}</p>
                      </div>
                      <svg
                        className='w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* More Features */}
            <div className='bg-white shadow-sm dashboard-card-p-6'>
              <h2 className='text-lg font-bold text-gray-900 mb-4'>Chức năng khác</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {managementFeatures.slice(4).map((feature, index) => {
                  const Icon = feature.icon
                  const colors = [
                    { bg: 'bg-emerald-50', icon: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
                    { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:bg-blue-100' }
                  ]
                  const color = colors[index % 2]

                  return (
                    <Link
                      key={index}
                      to={feature.link}
                      className={`group flex items-center gap-4 p-4 ${color.bg} ${color.hover} transition-all duration-300 hover:shadow-md`}
                    >
                      <div className='flex-shrink-0'>
                        <Icon className={`w-6 h-6 ${color.icon}`} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-semibold text-gray-900 truncate'>{feature.title}</h3>
                        <p className='text-sm text-gray-600 truncate'>{feature.description}</p>
                      </div>
                      <svg
                        className='w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Event Status */}
          <div className='flex flex-col gap-6'>
            {/* Event Status Statistics */}
            <div className='shadow-sm dashboard-event-status text-white flex-1 bg-gradient-to-br from-blue-600 to-blue-700'>
              <h2 className='text-lg font-bold mb-4'>Trạng thái sự kiện</h2>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CalendarClock className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Sắp diễn ra</span>
                  </div>
                  <span className='text-xl font-bold'>{upcomingEvents}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CalendarCheck className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Đang mở đăng ký</span>
                  </div>
                  <span className='text-xl font-bold'>{openEvents}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Play className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Đang diễn ra</span>
                  </div>
                  <span className='text-xl font-bold'>{ongoingEvents}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Đã kết thúc</span>
                  </div>
                  <span className='text-xl font-bold'>{endedEvents}</span>
                </div>
              </div>
            </div>

            {/* Approval Status Statistics */}
            <div
              className='shadow-sm dashboard-approval-stats text-white flex-1'
              style={{ backgroundColor: '#3e3e3a' }}
            >
              <h2 className='text-lg font-bold mb-4'>Thống kê phê duyệt</h2>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Chờ duyệt</span>
                  </div>
                  <span className='text-xl font-bold'>{waitingApproval}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Đã duyệt</span>
                  </div>
                  <span className='text-xl font-bold'>{approvedEvents}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <XCircle className='w-5 h-5 opacity-90' />
                    <span className='text-base opacity-90'>Từ chối</span>
                  </div>
                  <span className='text-xl font-bold'>{rejectedEvents}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
