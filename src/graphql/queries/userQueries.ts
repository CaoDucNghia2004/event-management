import { gql } from '@apollo/client/core'

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users(first: 10000) {
      data {
        id
        name
        email
        created_at
      }
      paginatorInfo {
        total
        count
        currentPage
        lastPage
      }
    }
  }
`

