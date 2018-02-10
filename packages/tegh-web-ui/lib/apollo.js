import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
// import fetch from 'isomorphic-fetch'

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


const createClient = () => {
  return new ApolloClient({
    link: createLink(),
    cache: new InMemoryCache(),
  })
}

export default createClient
