import z from 'zod'

export const RegisterBody = z
  .object({
    username: z.string().trim().nonempty('Tên người dùng là bắt buộc'),
    email: z
      .string()
      .trim()
      .nonempty('Vui lòng nhập email')
      .refine((val) => /\S+@\S+\.\S+/.test(val), {
        message: 'Email không hợp lệ'
      }),
    password: z.string().min(6, 'Mật khẩu ít nhất là 6 ký tự').max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
    password_confirmation: z.string().min(6, 'Vui lòng xác nhận mật khẩu')
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['password_confirmation']
  })

export type RegisterBodyType = z.infer<typeof RegisterBody>

export const RegisterResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    username: z.string(),
    email: z.string().refine((val) => /\S+@\S+\.\S+/.test(val), {
      message: 'Email không hợp lệ'
    }),
    is_active: z.boolean(),
    created_at: z.string()
  })
})

export type RegisterResponseType = z.infer<typeof RegisterResponse>

export const LoginBody = z.object({
  email: z
    .string()
    .trim()
    .nonempty('Vui lòng nhập email')
    .refine((val) => /\S+@\S+\.\S+/.test(val), {
      message: 'Email không hợp lệ'
    }),
  password: z.string().min(6, 'Mật khẩu ít nhất là 6 ký tự').max(50, 'Mật khẩu không được vượt quá 50 ký tự')
})

export type LoginBodyType = z.infer<typeof LoginBody>

export const LoginResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    account: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      phone: z.string().nullable(),
      roles: z.array(z.string()),
      is_active: z.boolean(),
      reputation_score: z.number().optional(),
      alerts: z.array(z.any()).optional().default([])
    }),
    access_token: z.string()
  })
})

export type LoginResponseType = z.infer<typeof LoginResponse>

export const SendCodeResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null()
})

export type SendCodeResponseType = z.infer<typeof SendCodeResponse>

export const VerifyCodeBody = z.object({
  code: z.string().trim().nonempty('Vui lòng nhập mã xác thực').length(6, 'Mã xác thực phải có 6 ký tự')
})

export type VerifyCodeBodyType = z.infer<typeof VerifyCodeBody>

export const VerifyCodeResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null()
})

export type VerifyCodeResponseType = z.infer<typeof VerifyCodeResponse>

export const LogoutResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null()
})

export type LogoutResponseType = z.infer<typeof LogoutResponse>

export const ForgotPasswordBody = z.object({
  email: z
    .string()
    .trim()
    .nonempty('Vui lòng nhập email')
    .refine((val) => /\S+@\S+\.\S+/.test(val), {
      message: 'Email không hợp lệ'
    })
})
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBody>

export const ForgotPasswordResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null()
})
export type ForgotPasswordResponseType = z.infer<typeof ForgotPasswordResponse>

export const ResetPasswordBody = z.object({
  email: z
    .string()
    .trim()
    .nonempty('Vui lòng nhập email')
    .refine((val) => /\S+@\S+\.\S+/.test(val), {
      message: 'Email không hợp lệ'
    }),
  code: z.string().trim().nonempty('Vui lòng nhập mã xác thực').length(6, 'Mã xác thực phải có 6 ký tự'),
  new_password: z
    .string()
    .min(6, 'Mật khẩu mới ít nhất là 6 ký tự')
    .max(50, 'Mật khẩu mới không được vượt quá 50 ký tự')
})
export type ResetPasswordBodyType = z.infer<typeof ResetPasswordBody>

export const ResetPasswordResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null()
})
export type ResetPasswordResponseType = z.infer<typeof ResetPasswordResponse>

export const RefreshResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    account: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      phone: z.string().nullable(),
      roles: z.array(z.string()),
      is_active: z.boolean(),
      reputation_score: z.number().optional(),
      alerts: z.array(z.any()).optional().default([])
    }),
    access_token: z.string()
  })
})

export type RefreshResponseType = z.infer<typeof RefreshResponse>
