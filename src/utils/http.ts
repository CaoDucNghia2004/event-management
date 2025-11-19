// import axios, { type AxiosInstance } from 'axios'
// import config from '../constants/config'
// import { getAccessTokenFromLS, setAccessTokenToLS, clearAccessTokenFromLS } from './utils'
// import { handleApiError } from './handleApiError'

// class Http {
//   instance: AxiosInstance

//   constructor() {
//     this.instance = axios.create({
//       baseURL: config.baseUrl,
//       timeout: 10000,
//       withCredentials: true,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })

//     this.instance.interceptors.request.use(
//       (config) => {
//         const token = getAccessTokenFromLS()
//         if (token && token.trim() !== '' && config.headers) {
//           config.headers.Authorization = `Bearer ${token}`
//         }

//         return config
//       },
//       (error) => Promise.reject(error)
//     )

//     this.instance.interceptors.response.use(
//       (response) => {
//         const { url } = response.config
//         if (url === '/api/v1/auth/login') {
//           const data = response.data
//           const token = data?.data?.access_token
//           if (token) setAccessTokenToLS(token)
//         }
//         return response
//       },
//       (error) => {
//         // ChỈ xử lý lỗi phân quyền (Forbidden)
//         const handled = handleApiError(error)
//         if (handled) {
//           return Promise.reject(null)
//         }

//         if (error.response?.status === 401) {
//           clearAccessTokenFromLS()
//         }
//         return Promise.reject(error)
//       }
//     )
//   }
// }

// const http = new Http().instance
// export default http

import axios, { type AxiosInstance } from 'axios'
import config from '../constants/config'
import { getAccessTokenFromLS, setAccessTokenToLS, clearAccessTokenFromLS } from './utils'
import { refreshAccessToken } from './refreshToken'

class Http {
  instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        const token = getAccessTokenFromLS()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        // Ghi token khi login lần đầu
        if (response.config.url === '/api/v1/auth/login') {
          const token = response.data?.data?.access_token
          if (token) setAccessTokenToLS(token)
        }
        return response
      },

      async (error) => {
        const originalRequest = error.config
        const status = error?.response?.status
        const message = (error?.response?.data?.message || '').toLowerCase()

        const tokenKeywords = ['token', 'jwt', 'expired', 'unauthenticated', 'not provided', 'invalid']

        const isTokenError = (status === 401 || status === 500) && tokenKeywords.some((kw) => message.includes(kw))

        if (isTokenError && !originalRequest._retry) {
          originalRequest._retry = true

          const newToken = await refreshAccessToken()

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.instance(originalRequest)
          }

          clearAccessTokenFromLS()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance
export default http
