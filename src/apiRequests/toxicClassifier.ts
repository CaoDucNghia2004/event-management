/**
 * Toxic Classifier API Service
 * Gọi API toxic classifier để kiểm tra nội dung độc hại
 */

const TOXIC_CLASSIFIER_API_URL = 'http://127.0.0.1:5000'

export interface ToxicClassifierResponse {
  success: boolean
  text?: string
  label?: 'positive' | 'negative' | 'neutral' | 'toxic'
  score?: number
  is_toxic?: boolean
  all_scores?: Array<{
    label: string
    score: number
  }>
  error?: string
}

/**
 * Kiểm tra một đoạn text có toxic không
 * @param text - Nội dung cần kiểm tra
 * @returns Promise với kết quả phân loại
 */
export const checkToxicComment = async (text: string): Promise<ToxicClassifierResponse> => {
  try {
    const response = await fetch(`${TOXIC_CLASSIFIER_API_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ToxicClassifierResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error calling toxic classifier API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Kiểm tra trạng thái của toxic classifier API
 * @returns Promise với trạng thái server
 */
export const checkToxicClassifierHealth = async (): Promise<{ status: string; model_loaded: boolean }> => {
  try {
    const response = await fetch(`${TOXIC_CLASSIFIER_API_URL}/health`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error checking toxic classifier health:', error)
    return {
      status: 'error',
      model_loaded: false
    }
  }
}

