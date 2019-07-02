import React, {
  useState,
  useMemo,
  useContext,
} from 'react'
import { ApolloProvider } from 'react-apollo'
import useReactRouter from 'use-react-router'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'

import snl from 'strip-newlines'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'

import { ThingLink, connect, parseInviteCode } from 'graphql-things/client'
import { UserDataContext } from './UserDataProvider'

let hostChangePromise = null

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
        // identityKeys: myIdentity,
        identityKeys: nextHostIdentity.identityKeys,
        peerIdentityPublicKey: nextHostIdentity.peerIdentityPublicKey,
        // eslint-disable-next-line no-console
        onMeta: meta => console.log('Received meta data', meta),
      }),
      options: { reconnect: false },
    })

    const errorLink = onError(({ graphQLErrors }) => {
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

    const nextClient = new ApolloClient({
      link: ApolloLink.from([
        // new ReduxLink(store),
        errorLink,
        thingLink,
      ]),
      cache: new InMemoryCache(),
    })

    return {
      client: nextClient,
      link: thingLink,
      prevHostIdentity: nextHostIdentity,
    }
  }

  const [{ link, client, prevHostIdentity }, setClient] = useState(createClient)

  const prevID = prevHostIdentity && prevHostIdentity.peerIdentityPublicKey
  const nextID = nextHostIdentity && nextHostIdentity.peerIdentityPublicKey

  if (nextID !== prevID) {
    if (link != null) link.client.close()
    // throw new Promise(() => {})

    if (hostChangePromise == null) {
      hostChangePromise = new Promise(resolve => setTimeout(() => {
        setClient(createClient())
        hostChangePromise = null
        resolve()
      }, 0))
    }

    throw hostChangePromise
  }

  if (nextHostIdentity == null) {
    return <>{ children}</>
  }

  return (
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        { children }
      </ApolloHooksProvider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
