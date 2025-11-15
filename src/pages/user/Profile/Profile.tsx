import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
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
import { Eye, EyeOff, TrendingUp, TrendingDown, Award, RefreshCw } from 'lucide-react'
import { GET_HISTORY_POINTS_BY_USER, GET_USER_REPUTATION_STATS } from '../../../graphql/queries/reputationQueries'
import type { HistoryPointsByUserData, UserReputationStatsData } from '../../../types/reputation.types'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'reputation'>('info')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserInfoResponseType['data'] | null>(null)
  const { setUser } = useAuthStore()

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasFetched = useRef(false)

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
          setPreviewAvatar(user.avatar || null)
        }
      } catch {
        toast.error('Không thể tải thông tin người dùng!')
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
        toast.success('Cập nhật thông tin thành công!')
        const updatedUser = { ...(userData as UserInfoResponseType['data']), ...data }
        setUserData(updatedUser)
        setUser(updatedUser)
      } else {
        toast.error(res.data?.message || 'Không thể cập nhật thông tin!')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật!')
    }
  }

  const onSubmitPassword = async (data: ChangePasswordBodyType) => {
    try {
      const res = await userApiRequests.changePassword(data)
      if (res.status === 200) {
        toast.success('Đổi mật khẩu thành công!')
        resetPassword()
      } else {
        toast.error(res.data?.message || 'Không thể đổi mật khẩu!')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi đổi mật khẩu!')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPreviewAvatar(previewUrl)
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
                      src={previewAvatar || userData?.avatar || '/default-avatar.png'}
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
  const {
    data: historyData,
    loading: historyLoading,
    refetch: refetchHistory
  } = useQuery<HistoryPointsByUserData>(GET_HISTORY_POINTS_BY_USER, {
    variables: { user_id: userData?.id },
    skip: !userData?.id
  })

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats
  } = useQuery<UserReputationStatsData>(GET_USER_REPUTATION_STATS, {
    variables: { user_id: userData?.id },
    skip: !userData?.id
  })

  const handleRefresh = async () => {
    await Promise.all([refetchHistory(), refetchStats()])
    toast.success('Đã cập nhật dữ liệu mới!')
  }

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
        return <TrendingUp className='w-5 h-5 text-green-600' />
      case 'LATE_CANCELLATION':
      case 'NO_SHOW':
        return <TrendingDown className='w-5 h-5 text-red-600' />
      default:
        return <Award className='w-5 h-5 text-gray-600' />
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold text-gray-800'>Điểm uy tín</h2>
        <button
          onClick={handleRefresh}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
        >
          <RefreshCw className='w-4 h-4' />
          <span>Làm mới</span>
        </button>
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

      {/* Thống kê */}
      {statsLoading ? (
        <div className='text-center py-8 text-gray-500'>Đang tải thống kê...</div>
      ) : statsData?.userReputationStats ? (
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Thống kê</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
              <p className='text-sm text-gray-600 mb-1'>Đã tham gia</p>
              <p className='text-3xl font-bold text-green-600'>{statsData.userReputationStats.total_events_attended}</p>
            </div>
            <div className='bg-red-50 rounded-lg p-4 border border-red-200'>
              <p className='text-sm text-gray-600 mb-1'>Vắng mặt</p>
              <p className='text-3xl font-bold text-red-600'>{statsData.userReputationStats.total_no_shows}</p>
            </div>
            <div className='bg-orange-50 rounded-lg p-4 border border-orange-200'>
              <p className='text-sm text-gray-600 mb-1'>Hủy muộn</p>
              <p className='text-3xl font-bold text-orange-600'>
                {statsData.userReputationStats.total_late_cancellations}
              </p>
            </div>
            <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
              <p className='text-sm text-gray-600 mb-1'>Điểm tích lũy</p>
              <p className='text-3xl font-bold text-blue-600'>+{statsData.userReputationStats.total_points_gained}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lịch sử điểm */}
      <div>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Lịch sử thay đổi điểm</h3>
        {historyLoading ? (
          <div className='text-center py-8 text-gray-500'>Đang tải lịch sử...</div>
        ) : historyData?.historyPointsByUser && historyData.historyPointsByUser.length > 0 ? (
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {historyData.historyPointsByUser.map((point) => (
              <div key={point.id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'>
                <div className='flex items-center gap-4 flex-1'>
                  {getActionIcon(point.action_type)}
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-gray-800'>{getActionText(point.action_type)}</span>
                      {point.event && <span className='text-sm text-gray-500'>- {point.event.title}</span>}
                    </div>
                    <p className='text-sm text-gray-600'>{point.reason}</p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {new Date(point.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <div className={`text-2xl font-bold ${point.change_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {point.change_amount > 0 ? '+' : ''}
                    {point.change_amount}
                  </div>
                  <p className='text-xs text-gray-500'>
                    {point.old_point} → {point.new_point}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12 text-gray-500'>
            <Award className='w-16 h-16 mx-auto mb-3 text-gray-300' />
            <p>Chưa có lịch sử thay đổi điểm</p>
          </div>
        )}
      </div>
    </div>
  )
}
