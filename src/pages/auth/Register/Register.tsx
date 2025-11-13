import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { RegisterBody, type RegisterBodyType } from '../../../schemaValidations/auth.schema'
import authApiRequests from '../../../apiRequests/auth'

export default function Register() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePassword = () => setShowPassword((prev) => !prev)
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev)

  const onSubmit = async (data: RegisterBodyType) => {
    try {
      const res = await authApiRequests.register(data)
      if (res.status === 201) {
        toast.success(res.data.message || 'Đăng ký thành công!')
        navigate('/login')
      } else {
        toast.error(res.data.message || 'Đăng ký thất bại!')
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.message

      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            setError(field as keyof RegisterBodyType, { message: messages[0] })
          }
        })
      } else {
        toast.error(error?.response?.data?.message || 'Đăng ký thất bại!')
      }

      console.error(error)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-center text-blue-600 mb-6'>Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
          <div>
            <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>
              Họ và tên
            </label>
            <input
              id='username'
              type='text'
              {...register('username')}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Nhập họ và tên'
            />
            {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email sinh viên
            </label>
            <input
              id='email'
              type='email'
              {...register('email')}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='example@huit.edu.vn'
            />
            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          <div className='relative'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Mật khẩu
            </label>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Nhập mật khẩu'
            />

            <button
              type='button'
              onClick={togglePassword}
              className='absolute right-3  top-11 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.875-7.5a10.05 10.05 0 012.29-3.64m4.046-2.468A9.972 9.972 0 0112 5c5 0 9.27 3.11 10.875 7.5a10.04 10.04 0 01-4.106 4.58M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 3l18 18' />
                </svg>
              )}
            </button>

            {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
          </div>

          <div className='relative'>
            <label htmlFor='password_confirmation' className='block text-sm font-medium text-gray-700 mb-1'>
              Xác nhận mật khẩu
            </label>
            <input
              id='password_confirmation'
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('password_confirmation')}
              className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Nhập lại mật khẩu'
            />

            <button
              type='button'
              onClick={toggleConfirmPassword}
              className='absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.875-7.5a10.05 10.05 0 012.29-3.64m4.046-2.468A9.972 9.972 0 0112 5c5 0 9.27 3.11 10.875 7.5a10.04 10.04 0 01-4.106 4.58M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 3l18 18' />
                </svg>
              )}
            </button>

            {errors.password_confirmation && (
              <p className='text-red-500 text-sm mt-1'>{errors.password_confirmation.message}</p>
            )}
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60'
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Đã có tài khoản?{' '}
          <a href='/login' className='text-blue-600 hover:underline'>
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  )
}
