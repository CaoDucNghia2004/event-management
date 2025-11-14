import { ApolloProvider } from '@apollo/client/react'
import useRouteElements from './useRouteElements'
import { ToastContainer } from 'react-toastify'
import apolloClient from './utils/apolloClient'

function App() {
  const routeElements = useRouteElements()
  return (
    // <div>
    //   {routeElements}
    //   <ToastContainer />
    // </div>
    <ApolloProvider client={apolloClient}>
      <div>
        {routeElements}
        <ToastContainer />
      </div>
    </ApolloProvider>
  )
}

export default App
