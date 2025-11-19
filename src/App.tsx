import { ApolloProvider } from '@apollo/client/react'
import useRouteElements from './useRouteElements'
import apolloClient from './utils/apolloClient'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import { getAccessTokenFromLS } from './utils/utils'
import { refreshAccessToken } from './utils/refreshToken'

function App() {
  const routeElements = useRouteElements()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const accessToken = getAccessTokenFromLS()

    // Nếu chưa login → không refresh
    if (!user) return

    // Nếu user đã login nhưng token mất → refresh
    if (!accessToken || accessToken.trim() === '') {
      refreshAccessToken()
    }
  }, [user])
  return (
    <ApolloProvider client={apolloClient}>
      <div>{routeElements}</div>
    </ApolloProvider>
  )
}

export default App
