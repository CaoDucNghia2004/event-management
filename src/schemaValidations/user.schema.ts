import z from 'zod'

export const UserInfoResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().nullable(),
    avatar: z.string().nullable(),
    is_active: z.boolean(),
    roles: z.array(z.string())
  })
})

export type UserInfoResponseType = z.infer<typeof UserInfoResponse>

export const EditProfileBody = z.object({
  name: z.string().trim().nonempty('Vui lòng nhập họ tên'),
  phone: z
    .string()
    .trim()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được vượt quá 15 số')
    .optional()
})

export type EditProfileBodyType = z.infer<typeof EditProfileBody>

export const EditProfileResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    avatar: z.string().nullable(),
    is_active: z.boolean(),
    roles: z.array(z.string())
  })
})

export type EditProfileResponseType = z.infer<typeof EditProfileResponse>

export const ChangePasswordBody = z
  .object({
    current_password: z.string().min(6, 'Mật khẩu hiện tại ít nhất 6 ký tự'),
    new_password: z.string().min(6, 'Mật khẩu mới ít nhất 6 ký tự'),
    new_password_confirmation: z.string().min(6, 'Vui lòng xác nhận mật khẩu mới')
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['new_password_confirmation']
  })

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBody>

export const ChangePasswordResponse = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null()
})

export type ChangePasswordResponseType = z.infer<typeof ChangePasswordResponse>
