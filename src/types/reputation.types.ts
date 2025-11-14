export interface HistoryPoint {
  id: string
  user_id: string
  event_id: string
  old_point: number
  new_point: number
  change_amount: number
  action_type: 'CHECK_IN' | 'LATE_CANCELLATION' | 'NO_SHOW'
  reason: string
  created_at: string
  event?: {
    id: string
    title: string
  }
}

export interface Alert {
  title: string
  message: string
  type: 'WARNING' | 'BLOCK_REGISTRATION'
  created_at: string
}

export interface ReputationStats {
  current_score: number
  total_events_attended: number
  total_no_shows: number
  total_late_cancellations: number
  total_points_gained: number
  total_points_lost: number
}

export interface HistoryPointsByUserData {
  historyPointsByUser: HistoryPoint[]
}

export interface UserReputationStatsData {
  userReputationStats: ReputationStats
}
