import type {
  ChangePasswordBodyType,
  ChangePasswordResponseType,
  EditProfileBodyType,
  EditProfileResponseType,
  UserInfoResponseType
} from '../schemaValidations/user.schema'
import http from '../utils/http'

const userApiRequests = {
  getProfile: () => http.get<UserInfoResponseType>('/api/v1/auth/me'),
  editProfile: (body: EditProfileBodyType) => http.put<EditProfileResponseType>('/api/v1/auth/edit-profile', body),
  changePassword: (body: ChangePasswordBodyType) =>
    http.put<ChangePasswordResponseType>('/api/v1/auth/change-password', body)
}
export default userApiRequests
