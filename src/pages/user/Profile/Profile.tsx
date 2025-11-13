import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import {
  ChangePasswordBody,
  EditProfileBody,
  type ChangePasswordBodyType,
  type EditProfileBodyType,
  type UserInfoResponseType
} from '../../../schemaValidations/user.schema'
import userApiRequests from '../../../apiRequests/user'
import { useAuthStore } from '../../../store/useAuthStore'
import { Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')
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
        </div>
      </div>
    </div>
  )
}
