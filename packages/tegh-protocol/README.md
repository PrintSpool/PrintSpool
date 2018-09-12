A javascript library for making things that work with Tegh 3D printers in node, react native and the browser.

## Useage

### TeghClient - Connecting to a Tegh 3D Printer

```javascript
import { TeghClient } from 'tegh-protocol'
import keypair from 'keypair'

// Generate a public and private key using the `keypair` npm module. This will
// identify you to the 3D printer so you only want to save this somewhere and
// re-use it on future connections.
var keys = keypair()
var signallingServer = 'ws://localhost:3000'

// create a tegh client
const teghClient = TeghClient({
  keys: keys,
  // The public key of the 3D printer. This uniquely identifies your 3D printer
  // and allows us to end-to-end encrypt everything you do with it. Usually
  // the public key is retreaved by scanning the QR Code displayed by Tegh on
  // the 3D printer's screen.
  peerPublicKey: '<your 3d printer public key here>',
  // provides access to the underlying SimplePeer object. This can be used to
  // access media tracks. Note: onConnect may be called more then once
  // if the 3d printer is re-connected.
  onConnect: (simplePeer) => {
    // access media tracks here
    console.log('web rtc connected', simplePeer)
  },
})

// the tegh client exposes an API that is compatible with `window.WebSocket` so
// we can use it with existing libaries which were designed for Web Sockets.
// Here we're using it with `subscriptions-transport-ws` for Apollo JS.
var subscriptionClient = new SubscriptionClient(signallingServer, {
  reconnect: true,
}, teghClient)

var wsLink = new WebSocketLink(subscriptionClient)

var apolloClient = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
})

React.render(
  (
    <ApolloProvider client={ apolloClient }>
      <Query
        query= 'query { printers { name, status }}'
        render= {(query) => {
          <div>
            {printer.name}: {printer.status}
          </div>
        }}
      />
    </ApolloProvider>
  ),
  document.getElementByID('main'),
)
```

### TeghHost - Acting as a Tegh 3D Printer

```javascript
import { TeghClient } from 'tegh-protocol'
import keypair from 'keypair'

// Generate a public and private key using the `keypair` npm module. This will
// identify you to the 3D printer so you only want to save this somewhere and
// re-use it on future connections.
var keys = keypair()
var signallingServer = 'ws://localhost:3000'

TeghHost({
  signallingServer: signallingServer,
  keys: keys,
  //
  authenticate: (userPublicKey) => {
    // `isAuthorized` is not defined in this example. Use your own authorization
    // function instead and return false if the user is unauthorized to connect.
    if (isAuthorized(userPublicKey)) return false
    return {
      connectedAt: Date.now(),
      userPublicKey: userPublicKey,
    },
  }
})
```
