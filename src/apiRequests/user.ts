import type {
  ChangePasswordBodyType,
  ChangePasswordResponseType,
  EditProfileBodyType,
  EditProfileResponseType,
  UserInfoResponseType,
  UploadAvatarResponseType
} from '../schemaValidations/user.schema'
import http from '../utils/http'

const userApiRequests = {
  getProfile: () => http.get<UserInfoResponseType>('/api/v1/auth/me'),
  editProfile: (body: EditProfileBodyType) => http.put<EditProfileResponseType>('/api/v1/auth/edit-profile', body),
  changePassword: (body: ChangePasswordBodyType) =>
    http.put<ChangePasswordResponseType>('/api/v1/auth/change-password', body),
  uploadAvatar: (formData: FormData) =>
    http.post<UploadAvatarResponseType>('/api/v1/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
}
export default userApiRequests
