import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAccessTokenFromLS, setAccessTokenToLS, clearAccessTokenFromLS } from '../utils/utils'
import type { LoginResponseType } from '../schemaValidations/auth.schema'

export type UserType = LoginResponseType['data']['account']

interface AuthState {
  user: UserType | null
  accessToken: string | null
  setUser: (user: UserType | null) => void
  setAccessToken: (token: string | null) => void
  logout: () => void
}
// dczcx
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: getAccessTokenFromLS(),

      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        if (token) setAccessTokenToLS(token)
        else clearAccessTokenFromLS()
        set({ accessToken: token })
      },

      logout: () => {
        clearAccessTokenFromLS()
        set({ user: null, accessToken: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user
      })
    }
  )
)
