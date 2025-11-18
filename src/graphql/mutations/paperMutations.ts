import { gql } from '@apollo/client'

export const CREATE_PAPER = gql`
  mutation CreatePaper($input: CreatePaperInput!) {
    createPaper(input: $input) {
      _id
      title
      abstract
      author
      event_id
      file_url
      view
      download
      category
      language
      keywords
      created_at
      updated_at
    }
  }
`

export const UPDATE_PAPER = gql`
  mutation UpdatePaper($input: UpdatePaperInput!) {
    updatePaper(input: $input) {
      _id
      title
      abstract
      author
      event_id
      file_url
      view
      download
      category
      language
      keywords
      created_at
      updated_at
    }
  }
`

export const DELETE_PAPER = gql`
  mutation DeletePaper($_id: ID!) {
    deletePaper(_id: $_id) {
      title
    }
  }
`
