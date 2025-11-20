// import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
// import config from '../constants/config'

// const httpLink = new HttpLink({
//   uri: config.graphqlUrl
// })

// const apolloClient = new ApolloClient({
//   link: httpLink,
//   cache: new InMemoryCache()
// })

// export default apolloClient

import { ApolloClient, InMemoryCache, HttpLink, from, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import type { GraphQLError } from 'graphql'
import config from '../constants/config'
import { getAccessTokenFromLS, setAccessTokenToLS } from './utils'
import authApiRequests from '../apiRequests/auth'
import Swal from 'sweetalert2'
import { translateMessage } from './translateMessage'

const httpLink = new HttpLink({
  uri: config.graphqlUrl
})

// Middleware để thêm JWT token vào header
const authLink = setContext((_, { headers }) => {
  const token = getAccessTokenFromLS()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      Authorization: token ? `Bearer ${token}` : '' // Thử cả 2 format
    }
  }
})

// Middleware để handle token expired và tự động refresh
const errorLink = onError(
  ({
    graphQLErrors,
    operation,
    forward
  }: {
    graphQLErrors?: readonly GraphQLError[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operation: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forward: any
  }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        // Kiểm tra token expired
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const backendError = err as any
        const errorMessage = backendError.details?.message || backendError.details?.debug?.message || err.message || ''

        if (errorMessage.includes('Token has expired') || errorMessage.includes('Unauthenticated')) {
          console.log('Token expired, attempting refresh...')

          // Thử refresh token
          return new Observable((observer) => {
            authApiRequests
              .refresh()
              .then((res) => {
                if (res.status === 200 && res.data.data.access_token) {
                  const newToken = res.data.data.access_token
                  setAccessTokenToLS(newToken)
                  console.log('Token refreshed successfully')

                  // Retry request với token mới
                  const oldHeaders = operation.getContext().headers
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      authorization: `Bearer ${newToken}`,
                      Authorization: `Bearer ${newToken}`
                    }
                  })

                  // Subscribe to retry
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer)
                  }

                  forward(operation).subscribe(subscriber)
                } else {
                  console.error('Refresh token failed')
                  // Redirect to login
                  window.location.href = '/login'
                  observer.complete()
                }
              })
              .catch((error) => {
                console.error('Refresh token error:', error)
                // Redirect to login
                window.location.href = '/login'
                observer.complete()
              })
          })
        }
        if (errorMessage.includes('Forbidden')) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: translateMessage(errorMessage)
          })
        }
      }
    }
  }
)

const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache()
})

export default apolloClient
