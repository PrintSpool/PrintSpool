// import { compose, withContext } from 'recompose'
import { ApolloProvider, Query } from 'react-apollo'
import gql from 'graphql-tag'

import QRReader from 'react-qr-reader'
const global = typeof window === 'undefined' ? {} : window


import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { concat } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { onError } from 'apollo-link-error'

import { TeghClient } from 'tegh-protocol'
import keypair from 'keypair'

const peerPublicKey = keypair({ bits: 1024 }).public

console.log('tegh', typeof TeghClient)

// Generate a public and private key using the `keypair` npm module. This will
// identify you to the 3D printer so you only want to save this somewhere and
// re-use it on future connections.
let keys = null
if (typeof localStorage !== 'undefined') {
  keys = localStorage.getItem('keys')
  if (keys == null) {
    keys = keypair()
    localStorage.setItem('keys', JSON.stringify(keys))
  } else  {
    keys = JSON.parse(keys)
  }
}

var signallingServer = 'ws://localhost:3000'

global.createTegh = () => {
  // create a tegh client
  const teghClient = TeghClient({
    keys,
    // The public key of the 3D printer. This uniquely identifies your 3D printer
    // and allows us to end-to-end encrypt everything you do with it. Usually
    // the public key is retreaved by scanning the QR Code displayed by Tegh on
    // the 3D printer's screen.
    peerPublicKey,
    // provides access to the underlying SimplePeer object. This can be used to
    // access media tracks. Note: onConnect may be called more then once
    // if the 3d printer is re-connected.
    onConnect: (simplePeer) => {
      // access media tracks here
      console.log('web rtc connected', simplePeer)
    },
  })
  // console.log(teghClient)

  // the tegh client exposes an API that is compatible with `window.WebSocket` so
  // we can use it with existing libaries which were designed for Web Sockets.
  // Here we're using it with `subscriptions-transport-ws` for Apollo JS.
  var subscriptionClient = new SubscriptionClient(signallingServer, {
    reconnect: true,
  }, teghClient)

  // console.log(subscriptionClient)
  clearTimeout(subscriptionClient.maxConnectTimeoutId)

  var wsLink = new WebSocketLink(subscriptionClient)

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

  const apolloClient = new ApolloClient({
    link: concat(
      errorLink,
      wsLink,
    ),
    cache: new InMemoryCache(),
  })

  return apolloClient
}

// const enhance = compose(
// )

// const p = process.browser ? simplePeerTest({initiator:  false}) : null
// <div
//   onClick={() => p.signal(JSON.parse(
//     document.querySelector('#signalInput').value
//   ))}
// >

// const Index = () => (
//   <div style={{ width: 300 }}>
//     <QRReader
//       onScan={scan => {
//         if (scan != null) {
//           console.log('SCAN', scan)
//         }
//       }}
//       style={{ width: '100%' }}
//     />
//   </div>
// )

const isNode = typeof navigator === 'undefined'
const client = isNode ? null : global.createTegh()

let Index = () => <div>Loading</div>

if (!isNode) {
  Index = () => (
    <ApolloProvider client={ client }>
      <Query query={gql`{ printers { id }}`}>
        {({ loading, error, data }) => (
          <div>
            {JSON.stringify({ loading, error, data })}
          </div>
        )}
      </Query>
    </ApolloProvider>
  )
}

// export default enhance(Index)

export default Index
