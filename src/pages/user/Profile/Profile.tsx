import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Swal from 'sweetalert2'
import { useQuery } from '@apollo/client/react'
import {
  ChangePasswordBody,
  EditProfileBody,
  type ChangePasswordBodyType,
  type EditProfileBodyType,
  type UserInfoResponseType
} from '../../../schemaValidations/user.schema'
import userApiRequests from '../../../apiRequests/user'
import { useAuthStore } from '../../../store/useAuthStore'
import { Eye, EyeOff, TrendingUp, TrendingDown, Award } from 'lucide-react'
import { GET_HISTORY_POINTS_BY_USER } from '../../../graphql/queries/reputationQueries'
import type { HistoryPointsByUserData } from '../../../types/reputation.types'
import config from '../../../constants/config'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'reputation'>('info')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserInfoResponseType['data'] | null>(null)
  const { setUser } = useAuthStore()

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasFetched = useRef(false)

  // Helper to get full avatar URL
  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    const fullUrl = `${config.baseUrl}${avatar}`
    console.log('🖼️ Avatar URL:', { avatar, fullUrl, baseUrl: config.baseUrl })
    return fullUrl
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EditProfileBodyType>({
    resolver: zodResolver(EditProfileBody),
    defaultValues: { name: '', phone: '' }
  })

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPassword,
    formState: { errors: errorsPass, isSubmitting: isSubmittingPass }
  } = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (hasFetched.current) return
      hasFetched.current = true

      try {
        const res = await userApiRequests.getProfile()
        if (res.status === 200 && res.data?.data) {
          const user = res.data.data
          setUserData(user)
          reset({ name: user.name, phone: user.phone || '' })
          setPreviewAvatar(getAvatarUrl(user.avatar))
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải thông tin người dùng!',
          confirmButtonText: 'Đóng'
        })
      }
    }

    fetchProfile()
  }, [reset])

  // Refetch profile khi chuyển sang tab reputation
  useEffect(() => {
    const refetchProfile = async () => {
      if (activeTab === 'reputation') {
        try {
          const res = await userApiRequests.getProfile()
          if (res.status === 200 && res.data?.data) {
            setUserData(res.data.data)
          }
        } catch {
          // Silent fail
        }
      }
    }
    refetchProfile()
  }, [activeTab])

  const onSubmitProfile = async (data: EditProfileBodyType) => {
    try {
      const res = await userApiRequests.editProfile(data)
      if (res.status === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật thông tin thành công!',
          showConfirmButton: false,
          timer: 1500
        })
        const updatedUser = { ...(userData as UserInfoResponseType['data']), ...data }
        setUserData(updatedUser)
        setUser(updatedUser)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: res.data?.message || 'Không thể cập nhật thông tin!',
          confirmButtonText: 'Đóng'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi khi cập nhật!',
        confirmButtonText: 'Đóng'
      })
    }
  }

  const onSubmitPassword = async (data: ChangePasswordBodyType) => {
    try {
      const res = await userApiRequests.changePassword(data)
      if (res.status === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đổi mật khẩu thành công!',
          showConfirmButton: false,
          timer: 1500
        })
        resetPassword()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: res.data?.message || 'Không thể đổi mật khẩu!',
          confirmButtonText: 'Đóng'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text:
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi khi đổi mật khẩu!',
        confirmButtonText: 'Đóng'
      })
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Kích thước ảnh không được vượt quá 5MB!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // Upload to server
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await userApiRequests.uploadAvatar(formData)

      if (res.status === 200 && res.data?.data) {
        const newAvatar = res.data.data.avatar

        console.log('✅ Upload success, avatar path:', newAvatar)

        // Update preview with full URL from backend
        setPreviewAvatar(getAvatarUrl(newAvatar))

        // Update user data in state and store
        const updatedUser = { ...(userData as UserInfoResponseType['data']), avatar: newAvatar }
        setUserData(updatedUser)
        setUser(updatedUser)

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật avatar thành công!',
          showConfirmButton: false,
          timer: 1500
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể upload avatar!',
          confirmButtonText: 'Đóng'
        })
      }
    } catch (error) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi khi upload avatar!'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: errorMsg,
        confirmButtonText: 'Đóng'
      })
    }
  }

  const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : '?')

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4 flex justify-center'>
      <div className='w-full max-w-7xl bg-white rounded-2xl shadow-md flex overflow-hidden'>
        <div className='w-1/4 border-r border-gray-200 bg-gray-100'>
          <div className='p-6'>
            <h2 className='text-xl font-bold text-gray-700 mb-6'>Tài khoản</h2>
            <nav className='flex flex-col space-y-2'>
              <button
                onClick={() => setActiveTab('info')}
                className={`text-left px-3 py-2 rounded-lg transition ${
                  activeTab === 'info' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`text-left px-3 py-2 rounded-lg transition ${
                  activeTab === 'password' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setActiveTab('reputation')}
                className={`text-left px-3 py-2 rounded-lg transition ${
                  activeTab === 'reputation'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Điểm uy tín
              </button>
            </nav>
          </div>
        </div>

        <div className='w-3/4 p-8'>
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit(onSubmitProfile)} className='space-y-6'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Thông tin cá nhân</h2>

              <div className='flex items-center space-x-6'>
                <div className='relative'>
                  {previewAvatar || userData?.avatar ? (
                    <img
                      src={previewAvatar || getAvatarUrl(userData?.avatar) || '/default-avatar.png'}
                      alt='Avatar'
                      className='w-24 h-24 rounded-full object-cover border border-gray-300'
                    />
                  ) : (
                    <div className='w-24 h-24 flex items-center justify-center rounded-full bg-blue-600 text-white text-3xl font-semibold'>
                      {getInitial(userData?.name)}
                    </div>
                  )}

                  <label
                    htmlFor='avatar'
                    className='absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={2}
                      stroke='currentColor'
                      className='w-4 h-4'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L9 19H5v-4l11.732-11.732z'
                      />
                    </svg>
                  </label>
                  <input type='file' id='avatar' accept='image/*' onChange={handleAvatarChange} className='hidden' />
                </div>

                <div>
                  <p className='text-gray-600 text-sm'>Email</p>
                  <p className='font-medium text-gray-800'>{userData?.email || 'Đang tải...'}</p>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Họ và tên</label>
                <input
                  type='text'
                  {...register('name')}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Nhập họ tên'
                />
                {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
                <input
                  type='text'
                  {...register('phone')}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Nhập số điện thoại'
                />
                {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone.message}</p>}
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60'
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleSubmitPass(onSubmitPassword)} className='space-y-5'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Đổi mật khẩu</h2>

              <div className='relative'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Mật khẩu hiện tại</label>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  {...registerPass('current_password')}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errorsPass.current_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Nhập mật khẩu hiện tại'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrent((prev) => !prev)}
                  className='absolute right-3 top-8 text-gray-500 hover:text-gray-700'
                >
                  {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errorsPass.current_password && (
                  <p className='text-red-500 text-sm mt-1'>{errorsPass.current_password.message}</p>
                )}
              </div>

              <div className='relative'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Mật khẩu mới</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  {...registerPass('new_password')}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errorsPass.new_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Nhập mật khẩu mới'
                />
                <button
                  type='button'
                  onClick={() => setShowNew((prev) => !prev)}
                  className='absolute right-3 top-8 text-gray-500 hover:text-gray-700'
                >
                  {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errorsPass.new_password && (
                  <p className='text-red-500 text-sm mt-1'>{errorsPass.new_password.message}</p>
                )}
              </div>

              <div className='relative'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Xác nhận mật khẩu mới</label>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...registerPass('new_password_confirmation')}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errorsPass.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Nhập lại mật khẩu mới'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className='absolute right-3 top-8 text-gray-500 hover:text-gray-700'
                >
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errorsPass.new_password_confirmation && (
                  <p className='text-red-500 text-sm mt-1'>{errorsPass.new_password_confirmation.message}</p>
                )}
              </div>

              <button
                type='submit'
                disabled={isSubmittingPass}
                className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60'
              >
                {isSubmittingPass ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}

          {activeTab === 'reputation' && <ReputationTab userData={userData} />}
        </div>
      </div>
    </div>
  )
}

function ReputationTab({ userData }: { userData: UserInfoResponseType['data'] | null }) {
  const { data: historyData, loading: historyLoading } = useQuery<HistoryPointsByUserData>(GET_HISTORY_POINTS_BY_USER, {
    variables: { user_id: userData?.id },
    skip: !userData?.id,
    fetchPolicy: 'cache-and-network', // Luôn fetch từ network để có data mới nhất
    notifyOnNetworkStatusChange: true
  })

  const reputationScore = userData?.reputation_score ?? 70
  const alerts = userData?.alerts ?? []

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-600'
    if (score >= 50) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CHECK_IN':
        return (
          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg'>
            <TrendingUp className='w-6 h-6 text-white' />
          </div>
        )
      case 'LATE_CANCELLATION':
        return (
          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg'>
            <TrendingDown className='w-6 h-6 text-white' />
          </div>
        )
      case 'NO_SHOW':
        return (
          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg'>
            <TrendingDown className='w-6 h-6 text-white' />
          </div>
        )
      default:
        return (
          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg'>
            <Award className='w-6 h-6 text-white' />
          </div>
        )
    }
  }

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case 'CHECK_IN':
        return 'Điểm danh'
      case 'LATE_CANCELLATION':
        return 'Hủy muộn'
      case 'NO_SHOW':
        return 'Vắng mặt'
      default:
        return actionType
    }
  }

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'CHECK_IN':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            Tích cực
          </span>
        )
      case 'LATE_CANCELLATION':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
            Cảnh báo
          </span>
        )
      case 'NO_SHOW':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            Vi phạm
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold text-gray-800'>Điểm uy tín</h2>
      </div>

      {/* Điểm hiện tại */}
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-gray-600 text-sm mb-2'>Điểm uy tín hiện tại</p>
            <div className='flex items-baseline gap-2'>
              <span className={`text-6xl font-bold ${getScoreColor(reputationScore)}`}>{reputationScore}</span>
              <span className='text-3xl text-gray-400'>/100</span>
            </div>
          </div>
          <Award className={`w-20 h-20 ${getScoreColor(reputationScore)}`} />
        </div>

        {/* Progress bar */}
        <div className='mt-4 bg-gray-200 rounded-full h-3 overflow-hidden'>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getScoreBgColor(reputationScore)}`}
            style={{ width: `${reputationScore}%` }}
          />
        </div>

        {/* Cảnh báo */}
        {reputationScore < 60 && (
          <div className='mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <p className='text-yellow-800 text-sm font-medium'>
              ⚠️{' '}
              {reputationScore < 50
                ? 'Bạn đã bị chặn đăng ký sự kiện mới vì điểm uy tín dưới 50.'
                : `Cảnh báo: Bạn chỉ còn ${reputationScore - 50} điểm nữa sẽ bị chặn đăng ký sự kiện.`}
            </p>
          </div>
        )}
      </div>

      {/* Thông báo từ hệ thống */}
      {alerts.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-800'>Thông báo</h3>
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === 'BLOCK_REGISTRATION' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <h4
                className={`font-semibold mb-1 ${
                  alert.type === 'BLOCK_REGISTRATION' ? 'text-red-800' : 'text-yellow-800'
                }`}
              >
                {alert.title}
              </h4>
              <p className={`text-sm ${alert.type === 'BLOCK_REGISTRATION' ? 'text-red-700' : 'text-yellow-700'}`}>
                {alert.message}
              </p>
              <p className='text-xs text-gray-500 mt-2'>{new Date(alert.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lịch sử điểm */}
      <div>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Lịch sử thay đổi điểm</h3>
        {historyLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        ) : historyData?.historyPointsByUser && historyData.historyPointsByUser.length > 0 ? (
          <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
            {historyData.historyPointsByUser.map((point, index) => (
              <div
                key={point._id}
                className='group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Decorative gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-300' />

                <div className='relative flex items-start justify-between gap-4'>
                  {/* Left side - Icon & Info */}
                  <div className='flex items-start gap-4 flex-1'>
                    <div className='flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300'>
                      {getActionIcon(point.action_type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h4 className='font-bold text-gray-900 text-lg'>{getActionText(point.action_type)}</h4>
                        {getActionBadge(point.action_type)}
                      </div>
                      {point.event && (
                        <div className='mb-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2'>
                          <p className='text-sm font-medium text-blue-900 truncate' title={point.event.title}>
                            📅 {point.event.title}
                          </p>
                        </div>
                      )}
                      <p className='text-sm text-gray-600 mb-3 leading-relaxed'>{point.reason}</p>
                      <div className='flex items-center gap-2 text-xs text-gray-400'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span>
                          {new Date(point.created_at).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Points */}
                  <div className='text-right flex-shrink-0'>
                    <div
                      className={`text-4xl font-black mb-2 ${
                        point.change_amount > 0
                          ? 'text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-rose-600'
                      }`}
                    >
                      {point.change_amount > 0 ? '+' : ''}
                      {point.change_amount}
                    </div>
                    <div className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full'>
                      <span className='text-xs font-semibold text-gray-600'>{point.old_point}</span>
                      <svg className='w-3 h-3 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span className='text-xs font-bold text-gray-900'>{point.new_point}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-4'>
              <Award className='w-10 h-10 text-gray-400' />
            </div>
            <p className='text-gray-500 font-medium'>Chưa có lịch sử thay đổi điểm</p>
            <p className='text-gray-400 text-sm mt-2'>Tham gia sự kiện để tích lũy điểm uy tín</p>
          </div>
        )}
      </div>
    </div>
  )
}
