import { ApolloProvider } from '@apollo/client/react'
import useRouteElements from './useRouteElements'
import apolloClient from './utils/apolloClient'

function App() {
  const routeElements = useRouteElements()
  return (
    <ApolloProvider client={apolloClient}>
      <div>{routeElements}</div>
    </ApolloProvider>
  )
}

export default App
