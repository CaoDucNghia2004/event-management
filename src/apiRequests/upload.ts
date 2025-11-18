import http from '../utils/http'

interface UploadResponse {
  status: number
  message: string
  data: {
    url: string
    path: string
    filename: string
  }
}

const uploadApiRequests = {
  uploadEventImage: (formData: FormData) =>
    http.post<UploadResponse>('/api/v1/upload/event-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadAvatar: (formData: FormData) =>
    http.post<UploadResponse>('/api/v1/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export default uploadApiRequests
