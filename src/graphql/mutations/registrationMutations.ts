import { gql } from '@apollo/client/core'

export const CREATE_REGISTRATION = gql`
  mutation CreateRegistration($user_id: String!, $event_id: String!) {
    createRegistration(user_id: $user_id, event_id: $event_id) {
      id
      user_id
      event_id
      registration_at
      queue_order
      current_status
      code_roll_call
      is_attended
      status_history {
        name
        sequence
        changed_at
      }
      created_at
    }
  }
`

export const CANCEL_REGISTRATION = gql`
  mutation CancelRegistration($id: ID!, $cancel_reason: String) {
    cancelRegistration(id: $id, cancel_reason: $cancel_reason) {
      id
      current_status
      cancelled_at
      cancel_reason
    }
  }
`

export const CHECK_IN_REGISTRATION = gql`
  mutation CheckInRegistration($email: String!, $code: String!) {
    checkInRegistration(email: $email, code: $code) {
      id
      is_attended
      current_status
    }
  }
`
