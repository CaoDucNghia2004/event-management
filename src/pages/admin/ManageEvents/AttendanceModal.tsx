import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { X, Search, CheckCircle, Clock, Users } from 'lucide-react'
import type { Event } from '../../../types/event.types'
import { CHECK_IN_REGISTRATION } from '../../../graphql/mutations/registrationMutations'
import { GET_REGISTRATIONS_BY_EVENT } from '../../../graphql/queries/registrationQueries'
import type { RegistrationsData } from '../../../types/registration.types'
import Swal from 'sweetalert2'

interface AttendanceModalProps {
  event: Event
  onClose: () => void
}

export default function AttendanceModal({ event, onClose }: AttendanceModalProps) {
  const [email, setEmail] = useState('')
  const [attendanceCode, setAttendanceCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Query danh sách TẤT CẢ registrations (vì backend chưa có registrationsByEvent)
  const {
    loading: loadingRegistrations,
    data,
    refetch
  } = useQuery<RegistrationsData>(GET_REGISTRATIONS_BY_EVENT, {
    fetchPolicy: 'network-only'
  })

  const [checkInRegistration, { loading: checkingIn }] = useMutation(CHECK_IN_REGISTRATION, {
    onCompleted: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Điểm danh thành công! Sinh viên đã được cộng 5 điểm.',
        showConfirmButton: false,
        timer: 2000
      })
      setEmail('')
      setAttendanceCode('')
      // Refetch danh sách registrations sau khi điểm danh
      refetch()
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message || 'Không thể điểm danh. Vui lòng kiểm tra lại email và mã code.',
        confirmButtonText: 'Đóng'
      })
    }
  })

  // Filter registrations theo event_id ở frontend (vì backend trả về tất cả)
  const allRegistrations = data?.registrations || []
  const registrations = allRegistrations.filter((r) => r.event_id === event.id)
  const attendedList = registrations.filter((r) => r.is_attended === true)
  const notAttendedList = registrations.filter((r) => r.is_attended !== true)

  const handleMarkAttendance = async () => {
    if (!email.trim() || !attendanceCode.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin!',
        text: 'Vui lòng nhập đầy đủ email và mã code!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    try {
      await checkInRegistration({
        variables: {
          email: email.trim(),
          code: attendanceCode.trim()
        }
      })
    } catch (error) {
      // Error handled by onError callback
      console.error('Check-in error:', error)
    }
  }

  const filteredAttended = attendedList.filter((r) => {
    if (!r.user) return false
    const query = searchQuery.toLowerCase()
    return (
      r.user.name.toLowerCase().includes(query) ||
      r.user.email.toLowerCase().includes(query) ||
      (r.code_roll_call?.toLowerCase() || '').includes(query)
    )
  })

  const filteredNotAttended = notAttendedList.filter((r) => {
    if (!r.user) return false
    const query = searchQuery.toLowerCase()
    return (
      r.user.name.toLowerCase().includes(query) ||
      r.user.email.toLowerCase().includes(query) ||
      (r.code_roll_call?.toLowerCase() || '').includes(query)
    )
  })

  return (
    <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Điểm danh sự kiện</h2>
            <p className='text-purple-100 mt-1'>{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors'
            title='Đóng'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Stats */}
        <div className='p-6 bg-gray-50 border-b border-gray-200'>
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center gap-3'>
                <Users className='w-8 h-8 text-blue-600' />
                <div>
                  <p className='text-sm text-gray-600'>Tổng đăng ký</p>
                  <p className='text-2xl font-bold text-gray-900'>{registrations.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center gap-3'>
                <CheckCircle className='w-8 h-8 text-green-600' />
                <div>
                  <p className='text-sm text-gray-600'>Đã điểm danh</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {attendedList.length}{' '}
                    <span className='text-sm text-gray-500'>
                      ({registrations.length > 0 ? Math.round((attendedList.length / registrations.length) * 100) : 0}
                      %)
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center gap-3'>
                <Clock className='w-8 h-8 text-orange-600' />
                <div>
                  <p className='text-sm text-gray-600'>Chưa điểm danh</p>
                  <p className='text-2xl font-bold text-gray-900'>{notAttendedList.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Input */}
        <div className='p-6 bg-white border-b border-gray-200'>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>
            Nhập thông tin sinh viên để điểm danh:
          </label>
          <div className='grid grid-cols-2 gap-3 mb-3'>
            <div>
              <label className='block text-xs text-gray-600 mb-1'>Email sinh viên</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='VD: student@example.com'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                disabled={checkingIn || loadingRegistrations}
              />
            </div>
            <div>
              <label className='block text-xs text-gray-600 mb-1'>Mã code điểm danh</label>
              <input
                type='text'
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleMarkAttendance()}
                placeholder='VD: ABC123'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                disabled={checkingIn || loadingRegistrations}
              />
            </div>
          </div>
          <button
            onClick={handleMarkAttendance}
            disabled={checkingIn || loadingRegistrations}
            className='w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {checkingIn ? 'Đang xử lý...' : 'Điểm danh'}
          </button>
        </div>

        {/* Search */}
        <div className='p-6 bg-gray-50 border-b border-gray-200'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm theo tên, MSSV, hoặc mã code...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Lists */}
        <div className='flex-1 overflow-auto p-6'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Attended List */}
            <div>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <CheckCircle className='w-5 h-5 text-green-600' />
                Đã điểm danh ({filteredAttended.length})
              </h3>
              <div className='space-y-2'>
                {loadingRegistrations ? (
                  <p className='text-center text-gray-500 py-8'>Đang tải...</p>
                ) : (
                  <>
                    {filteredAttended.map((registration) => (
                      <div key={registration.id} className='bg-green-50 border border-green-200 rounded-lg p-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <p className='font-semibold text-gray-900'>{registration.user?.name || 'N/A'}</p>
                            <p className='text-sm text-gray-600'>Email: {registration.user?.email || 'N/A'}</p>
                          </div>
                          <div className='text-right'>
                            <p className='text-xs text-gray-500'>
                              {registration.registration_at
                                ? new Date(registration.registration_at).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </p>
                            <p className='text-sm font-semibold text-green-600'>+5 điểm</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredAttended.length === 0 && (
                      <p className='text-center text-gray-500 py-8'>Chưa có sinh viên nào điểm danh</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Not Attended List */}
            <div>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <Clock className='w-5 h-5 text-orange-600' />
                Chưa điểm danh ({filteredNotAttended.length})
              </h3>
              <div className='space-y-2'>
                {loadingRegistrations ? (
                  <p className='text-center text-gray-500 py-8'>Đang tải...</p>
                ) : (
                  <>
                    {filteredNotAttended.map((registration) => (
                      <div key={registration.id} className='bg-orange-50 border border-orange-200 rounded-lg p-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <p className='font-semibold text-gray-900'>{registration.user?.name || 'N/A'}</p>
                            <p className='text-sm text-gray-600'>Email: {registration.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredNotAttended.length === 0 && (
                      <p className='text-center text-gray-500 py-8'>Tất cả đã điểm danh!</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
