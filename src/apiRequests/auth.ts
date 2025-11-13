import type {
  ForgotPasswordBodyType,
  ForgotPasswordResponseType,
  LoginBodyType,
  LoginResponseType,
  LogoutResponseType,
  RegisterBodyType,
  RegisterResponseType,
  ResetPasswordBodyType,
  ResetPasswordResponseType,
  SendCodeResponseType,
  VerifyCodeBodyType,
  VerifyCodeResponseType
} from '../schemaValidations/auth.schema'
import http from '../utils/http'

const authApiRequests = {
  register: (body: RegisterBodyType) => http.post<RegisterResponseType>('/api/v1/auth/register', body),
  login: (body: LoginBodyType) => http.post<LoginResponseType>('/api/v1/auth/login', body),
  sentCode: () => http.post<SendCodeResponseType>('/api/v1/auth/send-code'),
  verifyCode: (body: VerifyCodeBodyType) => http.post<VerifyCodeResponseType>('/api/v1/auth/verify-code', body),
  logout: () => http.post<LogoutResponseType>('/api/v1/auth/logout'),
  forgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<ForgotPasswordResponseType>('/api/v1/auth/forgot-password', body),
  resetPassword: (body: ResetPasswordBodyType) =>
    http.post<ResetPasswordResponseType>('/api/v1/auth/reset-password', body),
  refresh: () => http.get<LoginResponseType>('/api/v1/auth/refresh')
}
export default authApiRequests
