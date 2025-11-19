import authApiRequests from '../apiRequests/auth'
import { setAccessTokenToLS } from './utils'
import { useAuthStore } from '../store/useAuthStore'

let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

export async function refreshAccessToken() {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve)
    })
  }

  isRefreshing = true

  try {
    const res = await authApiRequests.refresh()

    const newToken = res.data.data.access_token

    setAccessTokenToLS(newToken)
    useAuthStore.getState().setAccessToken(newToken)

    refreshQueue.forEach((cb) => cb(newToken))
    refreshQueue = []

    return newToken
  } catch (err) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    return null
  } finally {
    isRefreshing = false
  }
}
