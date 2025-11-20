export interface Location {
  id: string
  name: string
  building?: string
  address?: string
  capacity?: number
}

export interface StatusHistory {
  name: string
  sequence: number
  changed_at: string
}

export interface ApprovalHistory {
  name: string
  sequence: number
  changed_at: string
}

export interface Speaker {
  name: string
  email?: string
  phone?: string
  avatar_url?: string
  organization?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  organizer: string
  topic?: string
  capacity: number
  waiting_capacity?: number
  image_url?: string
  current_status: string
  current_approval_status: string
  created_by: string
  location: Location
  approval_history?: ApprovalHistory[]
  status_history?: StatusHistory[]
  speakers?: Speaker[]
  created_at: string
  updated_at: string
}

export interface EventsData {
  events: Event[]
}

export interface EventData {
  event: Event
}
