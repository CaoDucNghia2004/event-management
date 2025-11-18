import { gql } from '@apollo/client/core'

export const GET_FEEDBACKS = gql`
  query GetFeedbacks {
    feedbacks {
      id
      registration_id
      event_id
      rating
      comments
      created_at
      updated_at
      registration {
        id
        user_id
        event_id
        user {
          id
          name
          email
        }
      }
      event {
        id
        title
      }
    }
  }
`

export const GET_FEEDBACKS_BY_USER = gql`
  query GetFeedbacksByUser($user_id: String!) {
    feedbacksByUser(user_id: $user_id) {
      id
      registration_id
      event_id
      rating
      comments
      created_at
      updated_at
      registration {
        id
        user_id
        event_id
      }
      event {
        id
        title
      }
    }
  }
`
