import { gql } from '@apollo/client'

export const CREATE_LOCATION = gql`
  mutation CreateLocation($name: String!, $building: String, $address: String, $capacity: Int) {
    createLocation(name: $name, building: $building, address: $address, capacity: $capacity) {
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

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($id: ID!, $name: String, $building: String, $address: String, $capacity: Int) {
    updateLocation(id: $id, name: $name, building: $building, address: $address, capacity: $capacity) {
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

export const DELETE_LOCATION = gql`
  mutation DeleteLocation($id: ID!) {
    deleteLocation(id: $id) {
      id
      name
    }
  }
`
