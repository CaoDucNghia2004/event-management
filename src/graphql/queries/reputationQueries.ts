import { gql } from '@apollo/client/core'

export const GET_HISTORY_POINTS_BY_USER = gql`
  query GetHistoryPointsByUser($user_id: String!) {
    historyPointsByUser(user_id: $user_id) {
      id
      user_id
      event_id
      old_point
      new_point
      change_amount
      action_type
      reason
      created_at
      event {
        id
        title
      }
    }
  }
`

export const GET_USER_REPUTATION_STATS = gql`
  query GetUserReputationStats($user_id: String!) {
    userReputationStats(user_id: $user_id) {
      current_score
      total_events_attended
      total_no_shows
      total_late_cancellations
      total_points_gained
      total_points_lost
    }
  }
`
