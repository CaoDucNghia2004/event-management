import type {
  NotificationsResponse,
  NotificationResponse,
  CreateNotificationInput,
  UpdateNotificationInput,
  DeleteNotificationResponse
} from '../types/notification.types'
import http from '../utils/http'

const notificationApiRequests = {
  // Lấy tất cả notifications
  getAll: () => http.get<NotificationsResponse>('/api/v1/notification'),

  // Tạo notification mới
  create: (body: CreateNotificationInput) => http.post<NotificationResponse>('/api/v1/notification', body),

  // Cập nhật notification
  update: (id: string, body: UpdateNotificationInput) =>
    http.put<NotificationResponse>(`/api/v1/notification/${id}`, body),

  // Xóa notification
  delete: (id: string) => http.delete<DeleteNotificationResponse>(`/api/v1/notification/${id}`)
}

// Export named function for SendMessageModal
export const sendNotification = (body: CreateNotificationInput) =>
  http.post<NotificationResponse>('/api/v1/notification', body)

export default notificationApiRequests
