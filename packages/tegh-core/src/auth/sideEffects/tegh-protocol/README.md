#  Apollo Client Initiator

```js
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

import { TeghLink } from 'tegh-protocol'

const {
  identityKeys,
  peerDatID,
  peerIdentityPublicKey,
} = YOUR_VALUES_HERE

const client = new ApolloClient({
  link: TeghLink({
    identityKeys,
    peerIdentityPublicKey,
  }),
  cache: new InMemoryCache(),
})
```
