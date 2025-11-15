import { gql } from '@apollo/client'

export const GET_ALL_LOCATIONS = gql`
  query GetAllLocations {
    locations {
      id
      name
      building
      address
      capacity
      created_at
      updated_at
    }
  }
`

export const GET_LOCATION_BY_ID = gql`
  query GetLocationById($id: ID!) {
    location(id: $id) {
      id
      name
      building
      address
      capacity
      created_at
      updated_at
    }
  }
`
