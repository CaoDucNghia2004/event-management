import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import {
  LoginBody,
  type LoginBodyType,
  VerifyCodeBody,
  type VerifyCodeBodyType
} from '../../../schemaValidations/auth.schema'
import authApiRequests from '../../../apiRequests/auth'
import { setAccessTokenToLS } from '../../../utils/utils'
import { useAuthStore } from '../../../store/useAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'login' | 'verify'>('login')
  const [email, setEmail] = useState('')

  const [cooldown, setCooldown] = useState(0)

  const { setUser, setAccessToken } = useAuthStore()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    setError: setErrorCode,
    formState: { errors: errorsCode, isSubmitting: isSubmittingCode }
  } = useForm<VerifyCodeBodyType>({
    resolver: zodResolver(VerifyCodeBody),
    defaultValues: {
      code: ''
    }
  })

  const togglePassword = () => setShowPassword((prev) => !prev)

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

  const onSubmit = async (data: LoginBodyType) => {
    try {
      const res = await authApiRequests.login(data)
      if (res.status === 200) {
        const { access_token, account } = res.data.data
        setAccessTokenToLS(access_token)

        // Lưu vào Zustand store
        setAccessToken(access_token)
        setUser(account)

        setEmail(account.email)

        if (!account.is_active) {
          toast.info('Tài khoản chưa được xác thực. Đang gửi mã kích hoạt...')
          await authApiRequests.sentCode()
          toast.success(`Mã xác thực đã được gửi tới ${account.email}`)
          setStep('verify')
          setCooldown(180)
          return
        }

        toast.success('Đăng nhập thành công!')
        navigate('/')
      } else {
        toast.error(res.data.message || 'Đăng nhập thất bại!')
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.message

      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            setError(field as keyof LoginBodyType, { message: messages[0] })
          }
        })
      } else {
        toast.error(error?.response?.data?.message || 'Đăng nhập thất bại!')
      }

      console.error(error)
    }
  }

  const onSubmitCode = async (data: VerifyCodeBodyType) => {
    try {
      const res = await authApiRequests.verifyCode(data)
      if (res.status === 200) {
        toast.success('Xác thực thành công!')
        navigate('/')
      } else {
        toast.error(res.data.message || 'Xác thực thất bại!')
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.message
      if (apiErrors) {
        setErrorCode('code', { message: apiErrors })
      } else {
        toast.error('Mã xác thực không hợp lệ!')
      }
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return

    try {
      const res = await authApiRequests.sentCode()
      if (res.status === 200) {
        toast.success(`Mã xác thực đã được gửi lại tới ${email}`)
        setCooldown(180)
      } else {
        toast.error('Không thể gửi lại mã, vui lòng thử lại!')
      }
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message

      if (status === 429) {
        toast.warning(message || 'Vui lòng chờ trước khi gửi lại mã.')
        const match = message?.match(/([\d.]+)\s*minutes/i)
        if (match) {
          const minutes = parseFloat(match[1])
          setCooldown(Math.ceil(minutes * 60))
        } else {
          setCooldown(180)
        }
      } else {
        toast.error('Lỗi khi gửi lại mã!')
      }

      console.error(error)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        {step === 'login' && (
          <>
            <h2 className='text-2xl font-bold text-center text-blue-600 mb-6'>Đăng nhập</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
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
                  className='absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
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

              <div className='flex justify-end my-5'>
                <a href='/forgot-password' className='text-sm text-blue-600 hover:underline transition'>
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60'
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>

            <p className='text-center text-sm text-gray-600 mt-6'>
              Chưa có tài khoản?{' '}
              <a href='/register' className='text-blue-600 hover:underline'>
                Đăng ký ngay
              </a>
            </p>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={handleSubmitCode(onSubmitCode)} noValidate className='space-y-4'>
            <h2 className='text-2xl font-bold text-center text-green-600 mb-3'>Xác thực tài khoản</h2>
            <p className='text-gray-600 text-sm text-center'>
              Mã xác thực đã được gửi tới <b>{email}</b>. Vui lòng nhập mã để tiếp tục.
            </p>

            <div>
              <label htmlFor='code' className='block text-sm font-medium text-gray-700 mb-1'>
                Mã xác thực
              </label>
              <input
                id='code'
                type='text'
                {...registerCode('code')}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  errorsCode.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Nhập mã xác thực'
              />
              {errorsCode.code && <p className='text-red-500 text-sm mt-1'>{errorsCode.code.message}</p>}
            </div>

            <div className='flex gap-2 mt-4 items-center'>
              <button
                type='submit'
                disabled={isSubmittingCode}
                className='flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60'
              >
                {isSubmittingCode ? 'Đang xác thực...' : 'Xác nhận'}
              </button>

              <button
                type='button'
                onClick={handleResendCode}
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
