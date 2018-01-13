import { InMemoryCache } from 'apollo-cache-inmemory'
import { withData } from 'next-apollo'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
// import fetch from 'isomorphic-fetch'

const ip = process.browser ? window.location.hostname : '127.0.0.1'
const port = 3900
const postURL = `http://${ip}:${port}/graphql`
const wsURL = `ws://${ip}:${port}/graphql`

// // Polyfill fetch() on the server (used by apollo-client)
// if (!process.browser) {
//   global.fetch = fetch
// }

const link = (() => {
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
})()

export default withData({
 link,
})
