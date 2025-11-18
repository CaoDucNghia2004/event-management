export interface Alert {
  title: string
  message: string
  type: 'BLOCK_REGISTRATION' | 'WARNING' | 'INFO' | 'SUCCESS'
  is_read: boolean
  is_deleted: boolean
  created_at: string
}

export interface UpdateAlertResponse {
  updateAlert: {
    success: boolean
    message: string
    alert: Alert & { alert_index: number }
  }
}

