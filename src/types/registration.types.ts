export interface StatusHistory {
  name: string
  sequence: number
  changed_at: string
}

export interface Registration {
  id: string
  user_id: string
  event_id: string
  registration_at: string
  cancelled_at?: string
  queue_order?: number | null
  current_status: string
  cancel_reason?: string
  is_attended?: boolean
  code_roll_call?: string
  status_history?: StatusHistory[]
  created_at: string
  updated_at?: string
  event?: {
    id: string
    title: string
    start_date: string
    end_date: string
    location?: {
      name: string
      address?: string
    }
  }
}

export interface RegistrationsData {
  registrations: Registration[]
}

export interface RegistrationsByUserData {
  registrationsByUser: Registration[]
}

export interface CreateRegistrationData {
  createRegistration: Registration
}

export interface CancelRegistrationData {
  cancelRegistration: Registration
}

export interface CheckInRegistrationData {
  checkInRegistration: Registration
}
