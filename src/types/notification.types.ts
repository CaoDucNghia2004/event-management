export interface Notification {
  id: string // Backend REST API trả về "id" chứ không phải "_id"
  event_id: string
  organizer_id: string
  message: string
  created_at: string
  updated_at: string
  event?: {
    id: string
    title: string
  }
}

export interface CreateNotificationInput {
  event_id: string
  organizer_id: string
  message: string
}

export interface UpdateNotificationInput {
  message: string
}

// API Response Types (wrapped in { data: ... })
export interface NotificationsResponse {
  data: {
    status: number
    message: string
    data: Notification[]
  }
}

export interface NotificationResponse {
  data: {
    status: number
    message: string
    data: Notification
  }
}

export interface DeleteNotificationResponse {
  data: {
    status: number
    message: string
    data: null
  }
}

// SSE Event types
export interface SSENotificationEvent {
  event: 'initial' | 'notification' | 'timeout'
  data:
    | {
        count?: number
        notifications?: Notification[]
        message?: string
      }
    | Notification
}
