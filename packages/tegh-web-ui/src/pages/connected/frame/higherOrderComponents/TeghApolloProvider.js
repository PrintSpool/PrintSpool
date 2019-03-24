import React from 'react'
import { ApolloProvider } from 'react-apollo'

import memoize from 'fast-memoize'

import snl from 'strip-newlines'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
// import { SubscriptionClient } from 'subscriptions-transport-ws'
import { onError } from 'apollo-link-error'
import ReduxLink from 'apollo-link-redux'

import { ThingLink } from 'graphql-things'

import { store } from '../../../../index'

const createTeghApolloClient = ({
  // myIdentity,
  hostIdentity,
  // signallingServer = 'ws://localhost:3000',
  // onWebRTCConnect = () => {},
  // onWebRTCDisconnect = () => {},
}) => {
  // The public key of the 3D printer. This uniquely identifies your 3D printer
  // and allows us to end-to-end encrypt everything you do with it. Usually
  // the public key is retreaved by scanning the QR Code displayed by Tegh on
  // the 3D printer's screen.

  const thingLink = ThingLink({
    // identityKeys: myIdentity,
    identityKeys: hostIdentity.identityKeys,
    peerIdentityPublicKey: hostIdentity.peerIdentityPublicKey,
    options: { reconnect: false },
  })

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
    // link: thingLink,
    link: ApolloLink.from([
      new ReduxLink(store),
      errorLink,
      thingLink,
    ]),
    cache: new InMemoryCache(),
  })

  return apolloClient
}

// TODO: does not work for some reason
const memoizedCreateTeghApolloClient = memoize(createTeghApolloClient, {
  serializer: ({ hostIdentity }) => hostIdentity.id,
})


class TeghApolloProvider extends React.Component {
  static getDerivedStateFromProps(props, state) {
    const {
      hostIdentity,
      myIdentity,
      onWebRTCConnect,
      onWebRTCDisconnect,
    } = props

    if (hostIdentity.id === state.hostID) {
      return state
    }
    // if (state.client != null) {
    //   // TODO: memory leak: no way to close old apollo clients AFAIK
    //   // state.client.close()
    // }

    const client = memoizedCreateTeghApolloClient({
      hostIdentity,
      myIdentity,
      onWebRTCConnect,
      onWebRTCDisconnect,
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
