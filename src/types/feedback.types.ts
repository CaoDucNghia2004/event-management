export interface Feedback {
  id: string
  registration_id: string
  event_id: string
  rating: number
  comments?: string
  is_hidden?: boolean
  created_at: string
  updated_at: string
  registration?: {
    id: string
    user_id: string
    event_id: string
    user?: {
      id: string
      name: string
      email: string
    }
  }
  event?: {
    id: string
    title: string
  }
}

export interface CreateFeedbackInput {
  registration_id: string
  event_id: string
  rating: number
  comments?: string
}

export interface UpdateFeedbackInput {
  registration_id?: string
  event_id?: string
  rating?: number
  comments?: string
  is_hidden?: boolean
}

export interface FeedbacksData {
  feedbacks: Feedback[]
}

export interface FeedbacksByUserData {
  feedbacksByUser: Feedback[]
}

export interface CreateFeedbackData {
  createFeedback: Feedback
}

export interface UpdateFeedbackData {
  updateFeedback: Feedback
}

export interface DeleteFeedbackData {
  deleteFeedback: Feedback
}
