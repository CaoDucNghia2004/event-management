import { gql } from '@apollo/client/core'

export const GET_ALL_EVENTS = gql`
  query GetAllEvents {
    events {
      id
      title
      description
      start_date
      end_date
      organizer
      topic
      capacity
      waiting_capacity
      image_url
      current_status
      current_approval_status
      location {
        id
        name
        building
        address
        capacity
      }
      approval_history {
        name
        sequence
        changed_at
      }
      status_history {
        name
        sequence
        changed_at
      }
      created_at
      updated_at
    }
  }
`

export const GET_EVENT_BY_ID = gql`
  query GetEventById($id: ID!) {
    event(id: $id) {
      id
      title
      description
      start_date
      end_date
      organizer
      topic
      capacity
      waiting_capacity
      image_url
      current_status
      current_approval_status
      location {
        id
        name
        building
        address
        capacity
      }
      created_at
      updated_at
    }
  }
`
