import { useParams, useNavigate } from 'react-router'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_EVENT_BY_ID } from '../../../graphql/queries/eventQueries'
import { CREATE_REGISTRATION } from '../../../graphql/mutations/registrationMutations'
import config from '../../../constants/config'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'
import Swal from 'sweetalert2'
import { useState } from 'react'
import RegistrationSuccessModal from '../../../components/RegistrationSuccessModal'
import { getUserIdFromToken } from '../../../utils/utils'
import type { CreateRegistrationData, Registration } from '../../../types/registration.types'
import type { EventData } from '../../../types/event.types'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [registrationData, setRegistrationData] = useState<Registration | null>(null)

  const { loading, error, data } = useQuery<EventData>(GET_EVENT_BY_ID, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only'
  })

  const [createRegistration, { loading: registering }] = useMutation<CreateRegistrationData>(CREATE_REGISTRATION, {
    onCompleted: (data) => {
      const registration = data.createRegistration
      setRegistrationData(registration)
      setShowSuccessModal(true)
    },
    onError: (error) => {
      console.error('Registration error:', error)
      console.log('Full error object:', JSON.stringify(error, null, 2))

      // Xử lý các lỗi từ backend
      let errorMessage = error.message || ''

      // Kiểm tra format error của backend (errors array)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendErrors = (error as any).errors
      if (backendErrors && backendErrors.length > 0) {
        console.log('Backend errors:', backendErrors)
        const firstError = backendErrors[0]

        if (firstError.details?.message) {
          errorMessage = firstError.details.message
        } else if (firstError.details?.debug?.message) {
          errorMessage = firstError.details.debug.message
        }
      }

      // Kiểm tra graphQLErrors (format chuẩn)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gqlErrors = (error as any).graphQLErrors
      console.log('GraphQL Errors:', gqlErrors)

      if (gqlErrors && gqlErrors.length > 0) {
        console.log('First GraphQL Error:', gqlErrors[0])
        console.log('Extensions:', gqlErrors[0].extensions)

        errorMessage = gqlErrors[0].message || errorMessage

        // Kiểm tra validation errors trong extensions
        if (gqlErrors[0].extensions?.validation) {
          console.log('Validation errors:', gqlErrors[0].extensions.validation)
          const validationErrors = Object.values(gqlErrors[0].extensions.validation).flat()
          errorMessage = validationErrors.join(', ')
        }
      }

      // Kiểm tra networkError
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const netError = (error as any).networkError
      console.log('Network Error:', netError)

      if (!errorMessage && netError) {
        console.log('Network error details:', netError.result)
        errorMessage = 'Lỗi kết nối! Vui lòng kiểm tra backend.'
      }

      console.log('Final error message:', errorMessage)

      // Xử lý token expired
      if (errorMessage.includes('Token has expired') || errorMessage.includes('expired')) {
        Swal.fire({
          icon: 'warning',
          title: 'Phiên đăng nhập hết hạn',
          text: 'Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.',
          confirmButtonText: 'Đóng'
        }).then(() => {
          navigate('/login')
        })
        return
      }

      if (errorMessage.includes('Điểm uy tín') || errorMessage.includes('reputation')) {
        Swal.fire({
          icon: 'error',
          title: 'Điểm uy tín thấp',
          text: 'Điểm uy tín của bạn quá thấp (< 50). Vui lòng tham gia thêm sự kiện để tăng điểm!',
          confirmButtonText: 'Đóng'
        })
      } else if (errorMessage.includes('đã đăng ký') || errorMessage.includes('already registered')) {
        Swal.fire({
          icon: 'warning',
          title: 'Thông báo',
          text: 'Bạn đã đăng ký sự kiện này rồi!',
          confirmButtonText: 'Đóng'
        })
      } else if (errorMessage.includes('đã đầy') || errorMessage.includes('full')) {
        Swal.fire({
          icon: 'error',
          title: 'Sự kiện đã đầy',
          text: 'Sự kiện đã đầy! Không còn chỗ trống.',
          confirmButtonText: 'Đóng'
        })
      } else if (errorMessage.includes('không tồn tại') || errorMessage.includes('not found')) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Sự kiện không tồn tại!',
          confirmButtonText: 'Đóng'
        })
      } else if (errorMessage.includes('OPEN')) {
        Swal.fire({
          icon: 'error',
          title: 'Chưa mở đăng ký',
          text: 'Sự kiện chưa mở đăng ký!',
          confirmButtonText: 'Đóng'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage || 'Đăng ký thất bại! Vui lòng thử lại.',
          confirmButtonText: 'Đóng'
        })
      }
    }
  })

  const handleRegister = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa đăng nhập',
        text: 'Vui lòng đăng nhập để đăng ký sự kiện!',
        confirmButtonText: 'Đóng'
      }).then(() => {
        navigate('/login')
      })
      return
    }

    // Lấy user_id từ JWT token
    const userId = getUserIdFromToken()

    console.log('User object:', user)
    console.log('User ID from JWT:', userId)
    console.log('Event ID:', id)

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể xác định user_id! Vui lòng đăng nhập lại.',
        confirmButtonText: 'Đóng'
      }).then(() => {
        navigate('/login')
      })
      return
    }

    // Confirmation dialog
    const result = await Swal.fire({
      title: 'Xác nhận đăng ký',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-3">Bạn có chắc chắn muốn đăng ký sự kiện này không?</p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="font-semibold text-gray-900 mb-2">${event?.title || 'Sự kiện'}</p>
            <p class="text-sm text-gray-600">HỘI TRƯỜNG ${event?.location?.name || 'N/A'}</p>
            <p class="text-sm text-gray-600">${event?.start_date ? format(new Date(event.start_date), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng ký ngay',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await createRegistration({
        variables: {
          user_id: userId,
          event_id: id
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin'></div>
          <p className='text-gray-500 text-sm'>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.event) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <div className='text-red-500 text-5xl mb-4'>⚠</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Không tìm thấy sự kiện</h2>
          <p className='text-gray-500 text-sm mb-6'>{error?.message || 'Sự kiện không tồn tại'}</p>
          <button
            onClick={() => navigate('/events')}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  const event = data.event

  const getStatusBadge = (status: string) => {
    type BadgeConfig = { bg: string; text: string; label: string; icon: typeof CheckCircle }
    const badges: Record<string, BadgeConfig> = {
      OPEN: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đang mở đăng ký', icon: CheckCircle },
      UPCOMING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sắp diễn ra', icon: Clock },
      ONGOING: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Đang diễn ra', icon: AlertCircle },
      ENDED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Đã kết thúc', icon: XCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy', icon: XCircle }
    }
    return badges[status] || badges.UPCOMING
  }

  const statusBadge = getStatusBadge(event.current_status)
  const StatusIcon = statusBadge.icon

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, dd 'tháng' MM, yyyy 'lúc' HH:mm", { locale: vi })
    } catch {
      return dateString
    }
  }

  const canRegister = event.current_status === 'OPEN' && event.current_approval_status === 'APPROVED'

  return (
    <>
      {/* Success Modal */}
      {registrationData && (
        <RegistrationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            setRegistrationData(null)
          }}
          registration={registrationData}
          eventTitle={event.title}
        />
      )}

      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'>
        {/* Back Button */}
        <div className='max-w-6xl mx-auto px-6 pt-8'>
          <button
            onClick={() => navigate('/events')}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group'
          >
            <ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
            <span className='font-medium'>Quay lại danh sách sự kiện</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className='max-w-6xl mx-auto px-6 py-8'>
          <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
            {/* Image */}
            <div className='relative h-96 bg-gradient-to-br from-blue-100 to-indigo-100'>
              {event.image_url ? (
                <img
                  src={`${config.baseUrl}${event.image_url}`}
                  alt={event.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-9xl'>🎓</div>
              )}

              {/* Status Badge */}
              <div className='absolute top-6 right-6'>
                <div
                  className={`${statusBadge.bg} ${statusBadge.text} px-4 py-2 rounded-full font-semibold flex items-center gap-2 backdrop-blur-sm`}
                >
                  <StatusIcon className='w-5 h-5' />
                  {statusBadge.label}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='p-8'>
              {/* Topic */}
              {event.topic && (
                <div className='flex items-center gap-2 text-blue-600 mb-4'>
                  <Tag className='w-4 h-4' />
                  <span className='text-sm font-semibold uppercase tracking-wide'>{event.topic}</span>
                </div>
              )}

              {/* Title */}
              <h1 className='text-4xl font-bold text-gray-900 mb-6'>{event.title}</h1>

              {/* Meta Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Calendar className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Thời gian bắt đầu</p>
                    <p className='font-semibold text-gray-900'>{formatDateTime(event.start_date)}</p>
                  </div>
                </div>

                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Clock className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Thời gian kết thúc</p>
                    <p className='font-semibold text-gray-900'>{formatDateTime(event.end_date)}</p>
                  </div>
                </div>

                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <MapPin className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Địa điểm</p>
                    <p className='font-semibold text-gray-900'>{event.location.name}</p>
                    {event.location.building && <p className='text-sm text-gray-600'>{event.location.building}</p>}
                    {event.location.address && <p className='text-sm text-gray-600'>{event.location.address}</p>}
                  </div>
                </div>

                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Users className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Sức chứa</p>
                    <p className='font-semibold text-gray-900'>
                      {event.capacity} người
                      {event.waiting_capacity && (
                        <span className='text-sm text-gray-600'> (+{event.waiting_capacity} chờ)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <User className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>Ban tổ chức</p>
                    <p className='font-semibold text-gray-900'>{event.organizer}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className='mb-8'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>Mô tả sự kiện</h2>
                  <div className='prose max-w-none text-gray-700 leading-relaxed'>{event.description}</div>
                </div>
              )}

              {/* Register Button */}
              <div className='border-t border-gray-200 pt-8'>
                {canRegister ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className='w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                  >
                    {registering ? (
                      <>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        <CheckCircle className='w-6 h-6' />
                        Đăng ký tham gia ngay
                      </>
                    )}
                  </button>
                ) : (
                  <div className='bg-gray-100 border border-gray-300 rounded-xl p-6 text-center'>
                    <p className='text-gray-700 font-semibold'>
                      {event.current_status === 'ENDED'
                        ? '❌ Sự kiện đã kết thúc'
                        : event.current_status === 'CANCELLED'
                          ? '❌ Sự kiện đã bị hủy'
                          : event.current_approval_status !== 'APPROVED'
                            ? '⏳ Sự kiện đang chờ phê duyệt'
                            : '🔒 Chưa mở đăng ký'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
