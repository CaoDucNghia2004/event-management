import { gql } from '@apollo/client'

export const UPDATE_ALERT = gql`
  mutation UpdateAlert($user_id: String!, $alert_index: Int!, $is_read: Boolean, $is_deleted: Boolean) {
    updateAlert(user_id: $user_id, alert_index: $alert_index, is_read: $is_read, is_deleted: $is_deleted) {
      success
      message
      alert {
        alert_index
        title
        message
        type
        is_read
        is_deleted
        created_at
      }
    }
  }
`

