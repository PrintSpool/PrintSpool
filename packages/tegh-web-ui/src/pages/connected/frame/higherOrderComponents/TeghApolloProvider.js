import React from 'react'
import { ApolloProvider } from 'react-apollo'

import memoize from 'fast-memoize'

import snl from 'strip-newlines'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { concat } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { onError } from 'apollo-link-error'

import { TeghClient } from 'tegh-protocol'

const createTeghApolloClient = ({
  myIdentity,
  hostIdentity,
  signallingServer = 'ws://localhost:3000',
}) => {
  // create a tegh client
  const teghClient = TeghClient({
    keys: myIdentity,
    // The public key of the 3D printer. This uniquely identifies your 3D printer
    // and allows us to end-to-end encrypt everything you do with it. Usually
    // the public key is retreaved by scanning the QR Code displayed by Tegh on
    // the 3D printer's screen.
    peerPublicKey: hostIdentity.public,
    // provides access to the underlying SimplePeer object. This can be used to
    // access media tracks. Note: onConnect may be called more then once
    // if the 3d printer is re-connected.
    onConnect: (simplePeer) => {
      // access media tracks here
      // eslint-disable-next-line no-console
      console.log('web rtc connected', simplePeer)
    },
  })

  // the tegh client exposes an API that is compatible with `window.WebSocket` so
  // we can use it with existing libaries which were designed for Web Sockets.
  // Here we're using it with `subscriptions-transport-ws` for Apollo JS.
  const subscriptionClient = new SubscriptionClient(
    signallingServer,
    {
      reconnect: true,
    },
    teghClient,
  )

  // console.log(subscriptionClient)
  clearTimeout(subscriptionClient.maxConnectTimeoutId)

  const wsLink = new WebSocketLink(subscriptionClient)

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      const errorMessages = graphQLErrors.map(
        ({ message, locations, path }) => {
          // eslint-disable-next-line no-console
          console.log(snl`
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
    if (networkError) alert(`[Network error]: ${networkError}`)
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

const memoizedCreateTeghApolloClient = memoize(createTeghApolloClient)

class TeghApolloProvider extends React.Component {
  static getDerivedStateFromProps(props, state) {
    const {
      hostIdentity,
      myIdentity
    } = props

    if (hostIdentity.id === state.hostID) {
      return {}
    }

    // if (state.client != null) {
    //   // TODO: memory leak: no way to close old apollo clients AFAIK
    //   // state.client.close()
    // }

    const client = memoizedCreateTeghApolloClient({
      hostIdentity,
      myIdentity
    })

    return {
      hostID: hostIdentity.id,
      client,
    }
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  // TODO: memory leak: no way to close old apollo clients AFAIK
  // componentWillUnmount() {
  //   const { client } = this.state
  //   client.close()
  // }

  render() {
    const { children } = this.props
    const { client } = this.state

    if (client == null) return <div />

    return (
      <ApolloProvider client={client}>
        { children }
      </ApolloProvider>
    )
  }
}

export default TeghApolloProvider
