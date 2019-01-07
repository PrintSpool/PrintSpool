#  Apollo Client Initiator

```js
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

import { TeghLink, InitiatorHandshake } from 'tegh-protocol'

const {
  datPeers,
  identityKeys,
  peerDatID,
  peerIdentityPublicKey,
} = YOUR_VALUES_HERE

const handshake = InitiatorHandshake({
  datPeers,
  identityKeys,
  peerDatID,
  peerIdentityPublicKey,
})

const client = new ApolloClient({
  link: TeghLink({ handshake }),
  cache: new InMemoryCache(),
})
```
