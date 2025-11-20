import { gql } from '@apollo/client/core'

export const RESET_ALL_USER_POINTS = gql`
  mutation ResetAllUserPoints($input: ResetAllUserPointsInput!) {
    resetAllUserPoints(input: $input) {
      success
      message
      updated_count
      total_users
      new_points
    }
  }
`

export const CREATE_USER = gql`
  mutation CreateUser($name: String, $email: String!, $password: String!, $phone: String) {
    createUser(name: $name, email: $email, password: $password, phone: $phone) {
      success
      message
      user {
        id
        name
        email
        phone
        is_active
        reputation_score
        roles
        created_at
      }
    }
  }
`

export const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($user_id: String!, $new_password: String!) {
    resetUserPassword(user_id: $user_id, new_password: $new_password) {
      success
      message
    }
  }
`

export const CHECK_AND_SEND_REPUTATION_ALERTS = gql`
  mutation CheckAndSendReputationAlerts {
    checkAndSendReputationAlerts {
      success
      message
      warning_count
      blocked_count
      skipped_count
      total_processed
    }
  }
`
