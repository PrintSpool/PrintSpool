import React, {
  useMemo,
  useRef,
  useContext,
} from 'react'
import { ApolloProvider } from 'react-apollo'
import useReactRouter from 'use-react-router'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'

import { ThingLink, connect, parseInviteCode } from 'graphql-things/client'
import { UserDataContext } from './UserDataProvider'
import ConnectionStatus from './common/ConnectionStatus'

const TegApolloProvider = ({
  children,
}) => {
  const { location, match } = useReactRouter()
  const { hosts } = useContext(UserDataContext)

  const nextHostIdentity = useMemo(() => {
    const params = new URLSearchParams(location.search)

    const inviteCode = params.get('invite')

    if (inviteCode != null) {
      return parseInviteCode(inviteCode)
    }

    const hostID = match.params.hostID || params.get('q')

    const host = hosts[hostID]
    return host && host.invite
  }, [location, match, hosts])

  const createClient = () => {
    if (nextHostIdentity == null) {
      return { prevHostIdentity: nextHostIdentity }
    }

    // The public key of the 3D machine. This uniquely identifies your 3D printer
    // and allows us to end-to-end encrypt everything you do with it. Usually
    // the public key is retreaved by scanning the QR Code displayed by Teg on
    // the 3D printer's screen.
    const thingLink = new ThingLink({
      createConnection: () => connect({
        // timeout: 1000,
        // identityKeys: myIdentity,
        identityKeys: nextHostIdentity.identityKeys,
        peerIdentityPublicKey: nextHostIdentity.peerIdentityPublicKey,
        // eslint-disable-next-line no-console
        onMeta: meta => console.log('Received meta data', meta),
      }),
    })

    const errorLink = onError(({ graphQLErrors }) => {
      // eslint-disable-next-line no-console
      console.error('Unexpected GraphQL Errors', graphQLErrors)
    })

    const nextClient = new ApolloClient({
      link: ApolloLink.from([
        // new ReduxLink(store),
        errorLink,
        thingLink,
      ]),
      resolvers: thingLink.resolvers,
      cache: new InMemoryCache(),
    })

    return {
      client: nextClient,
      link: thingLink,
      prevHostIdentity: nextHostIdentity,
    }
  }

  const clientRef = useRef({})

  const { prevHostIdentity, link } = clientRef.current

  const prevPeerID = prevHostIdentity && prevHostIdentity.peerIdentityPublicKey
  const nextPeerID = nextHostIdentity && nextHostIdentity.peerIdentityPublicKey

  if (prevPeerID !== nextPeerID) {
    if (link != null) {
      link.client.close()
    }

    clientRef.current = createClient()
  }

  const { client } = clientRef.current

  if (nextPeerID == null) {
    return <>{ children }</>
  }

  return (
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        <ConnectionStatus>
          { children }
        </ConnectionStatus>
      </ApolloHooksProvider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
