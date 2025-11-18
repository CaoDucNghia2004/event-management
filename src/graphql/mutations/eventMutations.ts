import { gql } from '@apollo/client'

export const CREATE_EVENT = gql`
  mutation CreateEvent(
    $title: String!
    $description: String
    $location_id: String!
    $start_date: DateTime!
    $end_date: DateTime!
    $organizer: String!
    $topic: String
    $capacity: Int!
    $waiting_capacity: Int
    $image_url: String
  ) {
    createEvent(
      title: $title
      description: $description
      location_id: $location_id
      start_date: $start_date
      end_date: $end_date
      organizer: $organizer
      topic: $topic
      capacity: $capacity
      waiting_capacity: $waiting_capacity
      image_url: $image_url
    ) {
      id
      title
      description
      location_id
      start_date
      end_date
      organizer
      topic
      capacity
      waiting_capacity
      image_url
      current_status
      current_approval_status
      created_at
      updated_at
    }
  }
`

export const UPDATE_EVENT = gql`
  mutation UpdateEvent(
    $id: ID!
    $title: String
    $description: String
    $location_id: String
    $start_date: DateTime
    $end_date: DateTime
    $organizer: String
    $topic: String
    $capacity: Int
    $waiting_capacity: Int
    $image_url: String
  ) {
    updateEvent(
      id: $id
      title: $title
      description: $description
      location_id: $location_id
      start_date: $start_date
      end_date: $end_date
      organizer: $organizer
      topic: $topic
      capacity: $capacity
      waiting_capacity: $waiting_capacity
      image_url: $image_url
    ) {
      id
      title
      description
      location_id
      start_date
      end_date
      organizer
      topic
      capacity
      waiting_capacity
      image_url
      current_status
      current_approval_status
      created_at
      updated_at
    }
  }
`

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`

export const APPROVE_EVENT = gql`
  mutation ApproveEvent($id: ID!, $status: String!) {
    updateApprovalStatus(id: $id, status: $status) {
      id
      title
      current_approval_status
      approval_history {
        name
        sequence
        changed_at
      }
    }
  }
`

export const ADVANCE_STATUS = gql`
  mutation AdvanceStatus($id: ID!) {
    advanceStatus(id: $id) {
      id
      title
      current_status
      status_history {
        name
        sequence
        changed_at
      }
    }
  }
`

export const CANCEL_EVENT = gql`
  mutation CancelEvent($id: ID!) {
    cancelEvent(id: $id) {
      id
      title
      current_status
      status_history {
        name
        sequence
        changed_at
      }
    }
  }
`
