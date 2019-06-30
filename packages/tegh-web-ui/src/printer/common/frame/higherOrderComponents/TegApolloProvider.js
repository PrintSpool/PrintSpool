import React, { useMemo } from 'react'
import { ApolloProvider } from 'react-apollo'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'

import memoize from 'fast-memoize'

import snl from 'strip-newlines'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
// import { SubscriptionClient } from 'subscriptions-transport-ws'
import { onError } from 'apollo-link-error'
// import ReduxLink from 'apollo-link-redux'

import { ThingLink, connect } from 'graphql-things/client'

// import { store } from '../../../../index'

export const createTegApolloLink = ({
  // myIdentity,
  hostIdentity,
  // signallingServer = 'ws://localhost:3000',
  // onWebRTCConnect = () => {},
  // onWebRTCDisconnect = () => {},
}) => {
  // The public key of the 3D machine. This uniquely identifies your 3D printer
  // and allows us to end-to-end encrypt everything you do with it. Usually
  // the public key is retreaved by scanning the QR Code displayed by Teg on
  // the 3D printer's screen.
  const thingLink = new ThingLink({
    createConnection: () => connect({
      // identityKeys: myIdentity,
      identityKeys: hostIdentity.identityKeys,
      peerIdentityPublicKey: hostIdentity.peerIdentityPublicKey,
      // eslint-disable-next-line no-console
      onMeta: meta => console.log('Received meta data', meta),
    }),
    options: { reconnect: false },
  })

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      const errorMessages = graphQLErrors.map(
        ({ message, locations, path }) => {
          // eslint-disable-next-line no-console
          console.error(snl`
            [GraphQL error]:
            Message: ${message}, Location: ${locations}, Path: ${path}
          `)
          return (snl`
            Unexpected GraphQL Error\n\n
            Message: ${message}\n
            Location: ${JSON.stringify(locations)}\n
            Path: ${path}
          `)
        },
      )
      // eslint-disable-next-line no-alert, no-undef
      if (errorMessages.length > 0) alert(errorMessages.join('\n\n'))
    }
    // eslint-disable-next-line no-alert, no-undef
    // if (networkError) alert(`[Network error]: ${networkError}`)
  })

  return ApolloLink.from([
    // new ReduxLink(store),
    errorLink,
    thingLink,
  ])
}

const createTegApolloClient = ({
  hostIdentity,
}) => {
  const link = createTegApolloLink({ hostIdentity })
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  return client
}

// TODO: does not work for some reason
const memoizedCreateTegApolloClient = memoize(createTegApolloClient, {
  serializer: ({ hostIdentity }) => hostIdentity && hostIdentity.id,
})


const TegApolloProvider = ({
  hostIdentity,
  children,
}) => {
  const state = useMemo(() => {
    // if (hostIdentity.id === state.hostID) {
    //   return state
    // }
    // if (state.client != null) {
    //   // TODO: memory leak: no way to close old apollo clients AFAIK
    //   // state.client.close()
    // }

    const client = memoizedCreateTegApolloClient({
      hostIdentity,
    })

    return {
      hostID: hostIdentity && hostIdentity.id,
      client,
    }
  })

  const { client } = state

  if (client == null) return <div />

  return (
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        { children }
      </ApolloHooksProvider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
