import { useQuery, useMutation } from '@apollo/client/react'
import { GET_REGISTRATIONS_BY_USER } from '../../../graphql/queries/registrationQueries'
import { CANCEL_REGISTRATION } from '../../../graphql/mutations/registrationMutations'

import { useAuthStore } from '../../../store/useAuthStore'
import userApiRequests from '../../../apiRequests/user'
import { getUserIdFromToken } from '../../../utils/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, MapPin, Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { FiEye } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { Registration, RegistrationsByUserData } from '../../../types/registration.types'

export default function MyRegistrations() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const userId = getUserIdFromToken()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Query danh sách đăng ký
  const { loading, error, data, refetch } = useQuery<RegistrationsByUserData>(GET_REGISTRATIONS_BY_USER, {
    variables: { user_id: userId },
    skip: !userId,
    fetchPolicy: 'network-only' // Luôn fetch data mới từ server
  })

  // Debug log
  useEffect(() => {
    if (data?.registrationsByUser) {
      console.log('=== REGISTRATION DATA ===')
      console.log('Full data:', data)
      console.log('Registrations:', data.registrationsByUser)
      if (data.registrationsByUser.length > 0) {
        console.log('First registration:', data.registrationsByUser[0])
        console.log('code_roll_call:', data.registrationsByUser[0].code_roll_call)
        console.log('is_attended:', data.registrationsByUser[0].is_attended)
      }
      console.log('========================')
    }
  }, [data])

  // Mutation hủy đăng ký
  const [cancelRegistration] = useMutation(CANCEL_REGISTRATION, {
    onCompleted: async () => {
      toast.success('✅ Hủy đăng ký thành công!')
      setShowCancelModal(false)
      setSelectedRegistration(null)
      setCancelReason('')
      setCancellingId(null)
      try {
        await refetch() // Reload danh sách
      } catch {
        // ignore
      }

      // Try refresh profile from backend and update global auth store so UI shows new reputation
      try {
        const profileRes = await userApiRequests.getProfile()
        if (profileRes?.status === 200 && profileRes.data?.data) {
          setUser(profileRes.data.data)
        }
      } catch {
        // ignore profile refresh errors
      }
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendErrors = (error as any).errors
      let errorMessage = error.message || 'Hủy đăng ký thất bại!'

      if (backendErrors && backendErrors.length > 0) {
        const firstError = backendErrors[0]
        if (firstError.details?.message) {
          errorMessage = firstError.details.message
        }
      }

      if (errorMessage.includes('đã bị hủy')) {
        toast.warning('⚠️ Đăng ký này đã bị hủy rồi!')
      } else if (errorMessage.includes('48') || errorMessage.includes('2 ngày')) {
        toast.error('⚠️ Hủy muộn sẽ bị trừ 3 điểm uy tín!')
      } else {
        toast.error(`❌ ${errorMessage}`)
      }
      setCancellingId(null)
    }
  })

  const handleCancelClick = (registration: Registration) => {
    setSelectedRegistration(registration)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedRegistration) return

    setCancellingId(selectedRegistration.id)
    await cancelRegistration({
      variables: {
        id: selectedRegistration.id,
        cancel_reason: cancelReason || null
      }
    })
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã xác nhận', icon: CheckCircle },
      WAITING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Đang chờ', icon: Clock },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy', icon: XCircle }
    }
    return badges[status] || badges.WAITING
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-16 h-16 text-yellow-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate('/login')}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    )
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

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <XCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Có lỗi xảy ra</h2>
          <p className='text-gray-500 mb-4'>{error.message}</p>
        </div>
      </div>
    )
  }

  const registrations = data?.registrationsByUser || []

  return (
    <>
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden'>
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-red-500 to-red-600 px-8 py-6'>
              <h3 className='text-2xl font-bold text-white flex items-center gap-3'>
                <XCircle className='w-7 h-7' />
                Xác nhận hủy đăng ký
              </h3>
            </div>

            {/* Modal Body */}
            <div className='px-8 py-6'>
              <p className='text-gray-700 mb-6 text-lg'>
                Bạn có chắc chắn muốn hủy đăng ký sự kiện:{' '}
                <span className='font-bold text-gray-900 block mt-2 text-xl'>{selectedRegistration?.event?.title}</span>
              </p>

              {/* Warning nếu hủy muộn */}
              {selectedRegistration?.event?.start_date && (
                <div className='bg-yellow-50 rounded-lg p-4 mb-6'>
                  <p className='text-sm text-yellow-800 flex items-start gap-2'>
                    <AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
                    <span>
                      <strong className='font-bold'>Lưu ý:</strong> Nếu hủy trong vòng 2 ngày trước sự kiện, bạn sẽ bị
                      trừ <strong className='font-bold'>3 điểm uy tín</strong>!
                    </span>
                  </p>
                </div>
              )}

              <div className='mb-6'>
                <label className='block text-base font-semibold text-gray-700 mb-3'>Lý do hủy (không bắt buộc)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-base'
                  rows={4}
                  placeholder='Ví dụ: Bận việc đột xuất, xung đột lịch...'
                />
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setSelectedRegistration(null)
                    setCancelReason('')
                  }}
                  className='flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all text-base'
                  disabled={!!cancellingId}
                >
                  Đóng
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={!!cancellingId}
                  className='flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base'
                >
                  {cancellingId ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12'>
        <div className='max-w-7xl mx-auto px-6'>
          {/* Header */}
          <div className='mb-10'>
            <h1 className='text-4xl font-bold text-gray-900 mb-3'>Đăng ký của tôi</h1>
            <p className='text-lg text-gray-600'>Quản lý các sự kiện bạn đã đăng ký tham gia</p>
          </div>

          {/* Registrations List */}
          {registrations.length === 0 ? (
            <div className='bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100'>
              <Calendar className='w-20 h-20 text-gray-300 mx-auto mb-6' />
              <h3 className='text-2xl font-bold text-gray-900 mb-3'>Chưa có đăng ký nào</h3>
              <p className='text-gray-500 mb-8 text-lg'>Bạn chưa đăng ký sự kiện nào. Hãy khám phá các sự kiện mới!</p>
              <button
                onClick={() => navigate('/events')}
                className='px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl'
              >
                Xem sự kiện
              </button>
            </div>
          ) : (
            <div className='space-y-6'>
              {registrations.map((registration) => {
                const statusBadge = getStatusBadge(registration.current_status)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={registration.id}
                    className='bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100'
                  >
                    {/* Header Card với status */}
                    <div className='bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-200'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                            {registration.event?.title || 'N/A'}
                          </h3>
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            <StatusIcon className='w-5 h-5' />
                            {statusBadge.label}
                            {registration.queue_order && (
                              <span className='ml-2 px-2 py-0.5 bg-white/50 rounded-full'>
                                Vị trí: #{registration.queue_order}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body Card */}
                    <div className='px-8 py-6'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                        <div className='flex items-start gap-4 p-4 bg-blue-50 rounded-xl'>
                          <div className='p-2 bg-blue-100 rounded-lg'>
                            <Calendar className='w-6 h-6 text-blue-600' />
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-blue-600 mb-1'>Thời gian sự kiện</p>
                            <p className='font-bold text-gray-900 text-base'>
                              {registration.event?.start_date ? formatDateTime(registration.event.start_date) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 bg-purple-50 rounded-xl'>
                          <div className='p-2 bg-purple-100 rounded-lg'>
                            <MapPin className='w-6 h-6 text-purple-600' />
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-purple-600 mb-1'>Địa điểm</p>
                            <p className='font-bold text-gray-900 text-base'>
                              {registration.event?.location?.name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 bg-green-50 rounded-xl'>
                          <div className='p-2 bg-green-100 rounded-lg'>
                            <Clock className='w-6 h-6 text-green-600' />
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-green-600 mb-1'>Đăng ký lúc</p>
                            <p className='font-bold text-gray-900 text-base'>
                              {formatDateTime(registration.registration_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Reason */}
                      {registration.cancel_reason && (
                        <div className='bg-red-50 rounded-lg p-4 mb-6'>
                          <p className='text-sm text-red-800'>
                            <strong className='font-bold'>Lý do hủy:</strong> {registration.cancel_reason}
                          </p>
                        </div>
                      )}

                      {/* Check-in Info - Hiển thị mã điểm danh và trạng thái điểm danh */}
                      {registration.current_status === 'CONFIRMED' && (
                        <div className='mb-6'>
                          {registration.is_attended ? (
                            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                              <div className='flex items-center gap-3'>
                                <div className='p-2 bg-green-100 rounded-lg'>
                                  <CheckCircle className='w-6 h-6 text-green-600' />
                                </div>
                                <div>
                                  <p className='font-bold text-green-800 text-base'>Đã điểm danh</p>
                                  <p className='text-sm text-green-600'>Bạn đã tham dự sự kiện này</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='bg-blue-50 border-2 border-blue-300 rounded-xl p-5'>
                              <div className='flex items-start gap-4'>
                                <div className='p-3 bg-blue-600 rounded-lg shadow-md'>
                                  <Clock className='w-7 h-7 text-white' />
                                </div>
                                <div className='flex-1'>
                                  <p className='font-bold text-blue-900 text-lg mb-3'>Mã điểm danh của bạn</p>
                                  <div className='flex items-center gap-3 mb-3'>
                                    <div className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg'>
                                      <code className='font-mono text-3xl font-extrabold text-white tracking-widest select-all'>
                                        {registration.code_roll_call || '------'}
                                      </code>
                                    </div>
                                  </div>
                                  <p className='text-sm text-blue-700 font-medium'>
                                    💡 Vui lòng nhớ mã này để điểm danh tại sự kiện
                                  </p>
                                  {!registration.code_roll_call && (
                                    <p className='text-xs text-red-600 mt-2 font-semibold'>
                                      ⚠️ Chưa có mã - Vui lòng liên hệ BTC
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className='flex gap-4 pt-6 border-t border-gray-200'>
                        <button
                          onClick={() => navigate(`/events/${registration.event_id}`)}
                          className='w-48 md:w-56 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-base'
                        >
                          <FiEye className='w-5 h-5' />
                          <span>Xem chi tiết</span>
                        </button>

                        {registration.current_status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelClick(registration)}
                            disabled={!!cancellingId}
                            className='px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base'
                          >
                            {cancellingId === registration.id ? 'Đang hủy...' : 'Hủy đăng ký'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
