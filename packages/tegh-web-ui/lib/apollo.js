import { InMemoryCache } from 'apollo-cache-inmemory'
import { withData } from 'next-apollo'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
// import fetch from 'isomorphic-fetch'

const ip = process.browser ? window.location.hostname : '127.0.0.1'
const uri = `http://${ip}:3900/graphql`
const websocketURI = `ws://${ip}:5000/graphql`

// // Polyfill fetch() on the server (used by apollo-client)
// if (!process.browser) {
//   global.fetch = fetch
// }

const link = (() => {
  if (process.browser) {
    const client = new SubscriptionClient(websocketURI, {
      reconnect: true,
    })
    return new WebSocketLink(client)
  } else {
    return new HttpLink({
      uri,
      opts: {
        credentials: 'same-origin'
      }
    })
  }
})()

export default withData({
 link,
})
