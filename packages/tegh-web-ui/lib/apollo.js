import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { concat } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
// import fetch from 'isomorphic-fetch'
import { onError } from 'apollo-link-error'

const isProduction = process.env.NODE_ENV === 'production'
const ip = process.browser ? window.location.hostname : '127.0.0.1'
const port = 3901
const postURL = `http://${ip}:${port}/graphql`
const wsURL = (() => {
  const wsPath = '/graphql'
  if (!process.browser) return null
  if (!isProduction) return `ws://${ip}:${port}${wsPath}`
  const { location } = window
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.host}${wsPath}`
})()

// // Polyfill fetch() on the server (used by apollo-client)
// if (!process.browser) {
//   global.fetch = fetch
// }

const createLink = (() => {
  if (process.browser) {
    const client = new SubscriptionClient(wsURL, {
      reconnect: true,
    })
    return new WebSocketLink(client)
  } else {
    return new HttpLink({
      postURL,
      opts: {
        credentials: 'same-origin'
      }
    })
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    const errorMessages = graphQLErrors.map(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: ` +
        `Message: ${message}, Location: ${locations}, Path: ${path}`
      )
      return (
        `Unexpected GraphQL Error\n\n` +
        `Message: ${message}\n`+
        `Location: ${JSON.stringify(locations)}\n`+
        `Path: ${path}`
      )
    })
    if (errorMessages.length > 0 ) alert(errorMessages.join('\n\n'))
  }
  if (networkError) console.log(`[Network error]: ${networkError}`)
})

const createClient = () => {
  return new ApolloClient({
    link: concat(
      errorLink,
      createLink(),
    ),
    cache: new InMemoryCache(),
  })
}

export default createClient
