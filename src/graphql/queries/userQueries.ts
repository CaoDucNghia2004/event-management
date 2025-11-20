import { gql } from '@apollo/client/core'

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUser {
      id
      name
      email
      phone
      avatar
      is_active
      reputation_score
      roles
      created_at
      updated_at
    }
  }
`
