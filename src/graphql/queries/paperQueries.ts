import { gql } from '@apollo/client'

export const GET_PAPERS = gql`
  query GetPapers {
    papers {
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
      event {
        id
        title
        location_id
        start_date
        end_date
        description
        created_by
      }
    }
  }
`

export const GET_PAPER_BY_ID = gql`
  query GetPaperById($_id: ID!) {
    paper(_id: $_id) {
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
      event {
        id
        title
        location_id
        start_date
        end_date
        description
      }
    }
  }
`
