import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'
import authApiRequests from '../../../apiRequests/auth'
import {
  ForgotPasswordBody,
  type ForgotPasswordBodyType,
  ResetPasswordBody,
  type ResetPasswordBodyType
} from '../../../schemaValidations/auth.schema'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [cooldown, setCooldown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordBodyType>({
    resolver: zodResolver(ForgotPasswordBody),
    defaultValues: { email: '' }
  })

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setError: setErrorReset,
    watch,
    formState: { errors: errorsReset, isSubmitting: isSubmittingReset }
  } = useForm<ResetPasswordBodyType>({
    resolver: zodResolver(ResetPasswordBody),
    defaultValues: { email: '', code: '', new_password: '' }
  })

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const onSubmitEmail = async (data: ForgotPasswordBodyType) => {
    try {
      const res = await authApiRequests.forgotPassword(data)
      console.log('Forgot response:', res)

      if (res.status === 200) {
        toast.success('Mã khôi phục đã được gửi đến email của bạn!')
        setStep('reset')
        setCooldown(180)
      } else {
        toast.error(res.data?.message || 'Không thể gửi mã khôi phục!')
      }
    } catch (error: any) {
      const message = error?.response?.data?.message
      setError('email', { message })
      toast.error(message || 'Lỗi khi gửi mã khôi phục!')
    }
  }

  const onSubmitReset = async (data: ResetPasswordBodyType) => {
    try {
      const res = await authApiRequests.resetPassword(data)
      console.log('Reset response:', res)

      if (res.status === 200 || res.status === 201) {
        toast.success('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.')
        navigate('/login')
      } else {
        toast.error(res.data?.message || 'Không thể đặt lại mật khẩu!')
      }
    } catch (error: any) {
      console.error('Reset error:', error)
      const apiErrors = error?.response?.data?.message
      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([field, msg]) => {
          if (Array.isArray(msg)) {
            setErrorReset(field as keyof ResetPasswordBodyType, { message: msg[0] })
          }
        })
      } else {
        toast.error(apiErrors || 'Lỗi khi đặt lại mật khẩu!')
      }
    }
  }

  const handleResendCode = async (email: string) => {
    if (cooldown > 0) return
    try {
      const res = await authApiRequests.forgotPassword({ email })
      if (res.status === 200) {
        toast.success(`Mã khôi phục đã được gửi lại tới ${email}`)
        setCooldown(180)
      } else {
        toast.error('Không thể gửi lại mã!')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi gửi lại mã!')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        {step === 'email' && (
          <>
            <h2 className='text-2xl font-bold text-center text-blue-600 mb-6'>Quên mật khẩu</h2>
            <form onSubmit={handleSubmit(onSubmitEmail)} noValidate className='space-y-4'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                  Nhập email của bạn
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

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60'
              >
                {isSubmitting ? 'Đang gửi mã...' : 'Gửi mã khôi phục'}
              </button>
            </form>

            <p className='text-center text-sm text-gray-600 mt-6'>
              Nhớ mật khẩu rồi?{' '}
              <a href='/login' className='text-blue-600 hover:underline'>
                Đăng nhập
              </a>
            </p>
          </>
        )}

        {step === 'reset' && (
          <form onSubmit={handleSubmitReset(onSubmitReset)} noValidate className='space-y-4'>
            <h2 className='text-2xl font-bold text-center text-green-600 mb-3'>Đặt lại mật khẩu</h2>
            <p className='text-gray-600 text-sm text-center mb-3'>
              Nhập lại email, mã khôi phục và mật khẩu mới để đặt lại tài khoản.
            </p>

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                id='email'
                type='email'
                {...registerReset('email')}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  errorsReset.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='example@huit.edu.vn'
              />
              {errorsReset.email && <p className='text-red-500 text-sm mt-1'>{errorsReset.email.message}</p>}
            </div>

            <div>
              <label htmlFor='code' className='block text-sm font-medium text-gray-700 mb-1'>
                Mã khôi phục
              </label>
              <input
                id='code'
                type='text'
                {...registerReset('code')}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  errorsReset.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Nhập mã gồm 6 chữ số'
              />
              {errorsReset.code && <p className='text-red-500 text-sm mt-1'>{errorsReset.code.message}</p>}
            </div>

            <div className='relative'>
              <label htmlFor='new_password' className='block text-sm font-medium text-gray-700 mb-1'>
                Mật khẩu mới
              </label>
              <input
                id='new_password'
                type={showPassword ? 'text' : 'password'}
                {...registerReset('new_password')}
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  errorsReset.new_password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Nhập mật khẩu mới'
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 top-9 text-gray-500 hover:text-gray-700'
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
              {errorsReset.new_password && (
                <p className='text-red-500 text-sm mt-1'>{errorsReset.new_password.message}</p>
              )}
            </div>

            <div className='flex gap-2 mt-4 items-center'>
              <button
                type='submit'
                disabled={isSubmittingReset}
                className='flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60'
              >
                {isSubmittingReset ? 'Đang đặt lại...' : 'Xác nhận'}
              </button>

              <button
                type='button'
                onClick={() => handleResendCode(watch('email'))}
                disabled={cooldown > 0}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'
                }`}
              >
                {cooldown > 0 ? `Gửi lại sau ${formatTime(cooldown)}` : 'Gửi lại mã'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
