import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import config from '../constants/config'

const httpLink = new HttpLink({
  uri: config.graphqlUrl
})

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

export default apolloClient
