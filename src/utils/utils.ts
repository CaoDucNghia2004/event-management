export const getAccessTokenFromLS = () => {
  return localStorage.getItem('access_token') || ''
}

export const setAccessTokenToLS = (access_token: string) => {
  return localStorage.setItem('access_token', access_token)
}

export const clearAccessTokenFromLS = () => {
  localStorage.removeItem('access_token')
}

/**
 * Decode JWT token để lấy user_id (sub)
 */
export const getUserIdFromToken = (): string | null => {
  const token = getAccessTokenFromLS()
  if (!token) return null

  try {
    // JWT có format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Decode base64 payload
    const payload = JSON.parse(atob(parts[1]))
    return payload.sub || null
  } catch (error) {
    console.error('Failed to decode JWT token:', error)
    return null
  }
}
