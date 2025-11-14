import { gql } from '@apollo/client/core'

export const GET_REGISTRATIONS_BY_USER = gql`
  query GetRegistrationsByUser($user_id: String!) {
    registrationsByUser(user_id: $user_id) {
      id
      user_id
      event_id
      registration_at
      cancelled_at
      queue_order
      current_status
      cancel_reason
      is_attended
      code_roll_call
      status_history {
        name
        sequence
        changed_at
      }
      event {
        id
        title
        start_date
        end_date
        location {
          name
          address
        }
      }
      created_at
      updated_at
    }
  }
`
