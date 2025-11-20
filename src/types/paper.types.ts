export interface Paper {
  _id: string
  title: string
  abstract?: string
  author: string[]
  event_id: string
  file_url?: string
  view: number
  download: number
  category?: string
  language?: string
  keywords?: string[]
  created_at: string
  updated_at: string
  event?: {
    id: string
    title: string
    location_id: string
    description?: string
    start_date?: string
    end_date?: string
    created_by: string
  }
}

export interface PapersResponse {
  papers: Paper[]
}

export interface PaperResponse {
  paper: Paper
}
