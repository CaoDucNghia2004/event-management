export interface LocationDetail {
  id: string
  name: string
  building?: string | null
  address?: string | null
  capacity?: number | null
  created_at?: string
  updated_at?: string
}

export interface LocationInput {
  name: string
  building?: string
  address?: string
  capacity?: number
}

export interface UpdateLocationInput extends LocationInput {
  id: string
}
