import { gql } from '@apollo/client/core'

export const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($input: CreateFeedbackInput!) {
    createFeedback(input: $input) {
      id
      registration_id
      event_id
      rating
      comments
      created_at
      updated_at
    }
  }
`

export const UPDATE_FEEDBACK = gql`
  mutation UpdateFeedback($id: ID!, $input: UpdateFeedbackInput!) {
    updateFeedback(id: $id, input: $input) {
      id
      registration_id
      event_id
      rating
      comments
      is_hidden
      created_at
      updated_at
    }
  }
`

export const DELETE_FEEDBACK = gql`
  mutation DeleteFeedback($id: ID!) {
    deleteFeedback(id: $id) {
      id
    }
  }
`
