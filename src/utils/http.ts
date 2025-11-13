import axios, { type AxiosInstance } from 'axios'
import config from '../constants/config'
import { getAccessTokenFromLS, setAccessTokenToLS, clearAccessTokenFromLS } from './utils'

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
        if (token && token.trim() !== '' && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url === '/api/v1/auth/login') {
          const data = response.data
          const token = data?.data?.access_token
          if (token) setAccessTokenToLS(token)
        }
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          clearAccessTokenFromLS()
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance
export default http
