import { useState, useEffect } from 'react'
import { FiMail, FiLock } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import {
  LoginBody,
  type LoginBodyType,
  VerifyCodeBody,
  type VerifyCodeBodyType
} from '../../../schemaValidations/auth.schema'
import authApiRequests from '../../../apiRequests/auth'
import { setAccessTokenToLS } from '../../../utils/utils'
import { useAuthStore } from '../../../store/useAuthStore'
import Swal from 'sweetalert2'
import { translateMessage } from '../../../utils/translateMessage'

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
    setValue: setValueCode,
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

        setEmail(account.email)

        // Kiểm tra tài khoản đã được kích hoạt chưa
        if (!account.is_active) {
          // KHÔNG lưu user vào store nếu chưa active
          Swal.fire({
            icon: 'info',
            title: 'Thông báo',
            text: 'Tài khoản chưa được xác thực. Đang gửi mã kích hoạt...',
            showConfirmButton: false,
            timer: 2000
          })
          await authApiRequests.sentCode()
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: `Mã xác thực đã được gửi tới ${account.email}`,
            confirmButtonText: 'Đóng'
          })
          setStep('verify')
          setCooldown(180)
          return
        }

        // Chỉ lưu token và user khi tài khoản đã active
        setAccessTokenToLS(access_token)
        setAccessToken(access_token)
        setUser(account)

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng nhập thành công!',
          showConfirmButton: false,
          timer: 1500
        })
        navigate('/')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: res.data.message || 'Đăng nhập thất bại!',
          confirmButtonText: 'Đóng'
        })
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
        const errorMessage = translateMessage(error?.response?.data?.message) || 'Đăng nhập thất bại!'

        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }

      console.error(error)
    }
  }

  const onSubmitCode = async (data: VerifyCodeBodyType) => {
    try {
      const res = await authApiRequests.verifyCode(data)
      if (res.status === 200) {
        // Sau khi xác thực thành công, lấy lại thông tin user và lưu vào store
        const profileRes = await authApiRequests.refresh()
        if (profileRes.status === 200) {
          const { access_token, account } = profileRes.data.data
          setAccessTokenToLS(access_token)
          setAccessToken(access_token)
          setUser(account)
        }

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Xác thực thành công!',
          showConfirmButton: false,
          timer: 1500
        })
        navigate('/')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: res.data.message || 'Xác thực thất bại!',
          confirmButtonText: 'Đóng'
        })
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.message
      if (apiErrors) {
        setErrorCode('code', { message: apiErrors })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Mã xác thực không hợp lệ!',
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return

    try {
      const res = await authApiRequests.sentCode()
      if (res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `Mã xác thực đã được gửi lại tới ${email}`,
          confirmButtonText: 'Đóng'
        })
        setCooldown(180)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể gửi lại mã, vui lòng thử lại!',
          confirmButtonText: 'Đóng'
        })
      }
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message

      if (status === 429) {
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo!',
          text: message || 'Vui lòng chờ trước khi gửi lại mã.',
          confirmButtonText: 'Đóng'
        })
        const match = message?.match(/([\d.]+)\s*minutes/i)
        if (match) {
          const minutes = parseFloat(match[1])
          setCooldown(Math.ceil(minutes * 60))
        } else {
          setCooldown(180)
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Lỗi khi gửi lại mã!',
          confirmButtonText: 'Đóng'
        })
      }

      console.error(error)
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center bg-cover bg-center px-4'
      style={{
        // Use an HUIT4 background image placed in the public folder as /huit4.jpg
        // This adds a light translucent overlay so the form remains readable.
        backgroundImage: "linear-gradient(rgba(13, 14, 15, 0.75), rgba(12, 13, 14, 0.75)), url('/HUIT4.jpg')"
      }}
    >
      <div className='w-full max-w-lg bg-white rounded-2xl shadow-lg p-10'>
        {step === 'login' && (
          <>
            <h2 className='text-3xl font-bold text-center text-blue-600 mb-4'>Đăng nhập</h2>

            {/* HUIT logo placed under the heading. Put logo1.jpg in public/ as /logo1.jpg */}
            <div className='flex justify-center mb-6'>
              <img src='/logo1.jpg' alt='HUIT logo' className='h-20 w-auto rounded-full shadow-sm' />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
              <div className='relative'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                  Email sinh viên
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <FiMail className='w-5 h-5' />
                  </span>
                  <input
                    id='email'
                    type='email'
                    {...register('email')}
                    className={`w-full border rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='example@huit.edu.vn'
                  />
                </div>
                {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
              </div>

              <div className='relative'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                  Mật khẩu
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <FiLock className='w-5 h-5' />
                  </span>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full border rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='Nhập mật khẩu'
                  />
                </div>
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
                className='w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60'
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
          <form onSubmit={handleSubmitCode(onSubmitCode)} noValidate className='space-y-6'>
            <h2 className='text-2xl font-bold text-center text-green-600 mb-3'>Xác thực tài khoản</h2>
            <p className='text-gray-600 text-sm text-center'>
              Mã xác thực đã được gửi tới <b>{email}</b>. Vui lòng nhập mã để tiếp tục.
            </p>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3 text-center'>Mã xác thực</label>
              <div className='flex justify-center gap-2'>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type='text'
                    maxLength={1}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 ${
                      errorsCode.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement
                      target.value = target.value.replace(/[^0-9]/g, '')
                      if (target.value && index < 5) {
                        const next = document.getElementById(`code-${index + 1}`) as HTMLInputElement
                        next?.focus()
                      }
                      const allInputs = Array.from(document.querySelectorAll('[id^="code-"]')) as HTMLInputElement[]
                      const code = allInputs.map((input) => input.value).join('')
                      setValueCode('code', code, { shouldValidate: true })
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
                        const prev = document.getElementById(`code-${index - 1}`) as HTMLInputElement
                        prev?.focus()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const paste = e.clipboardData
                        .getData('text')
                        .replace(/[^0-9]/g, '')
                        .slice(0, 6)
                      const inputs = Array.from(document.querySelectorAll('[id^="code-"]')) as HTMLInputElement[]
                      paste.split('').forEach((char, i) => {
                        if (inputs[i]) inputs[i].value = char
                      })
                      if (inputs[paste.length - 1]) inputs[paste.length - 1].focus()
                      const code = inputs.map((input) => input.value).join('')
                      setValueCode('code', code, { shouldValidate: true })
                    }}
                  />
                ))}
              </div>
              <input id='code' type='hidden' {...registerCode('code')} />
              {errorsCode.code && <p className='text-red-500 text-sm mt-2 text-center'>{errorsCode.code.message}</p>}
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
