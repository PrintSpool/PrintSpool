import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useContext,
} from 'react'
import { ApolloProvider } from 'react-apollo'
import useReactRouter from 'use-react-router'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'

import { GraphQL, GraphQLContext } from 'graphql-react'

import {
  Typography,
} from '@material-ui/core'
import base64url from 'base64url'

// import { ThingLink, connect, parseInviteCode } from 'graphql-things/client'
import { ThingLink, connect, parseInviteCode, createECDHKey } from 'graphql-things'

import { getID } from './UserDataProvider'
import ConnectionStatus from './common/ConnectionStatus'
import { useAuth0 } from './common/auth/auth0'
import userProfileServerFetchOptions from './common/userProfileServer/fetchOptions'

export const TegApolloContext = React.createContext(null)

const TegApolloProvider = ({
  children,
  slug: slugParam,
}) => {
  const { location, match } = useReactRouter()
  const auth0 = useAuth0()

  const [error, setError] = useState()
  const [connectionProps, setConnectionProps] = useState()
  const [machine, setMachine] = useState()

  const params = new URLSearchParams(location.search)
  const inviteCode = params.get('invite')

  const invite = useMemo(() => {
    if (inviteCode != null) {
      return parseInviteCode(base64url.toBase64(inviteCode))
    }
  }, [inviteCode])

  const slug = slugParam || (invite && getID(invite)) || match.params.hostID || params.get('q')

  // console.log({ inviteCode, invite, match, params, slug })

  // console.log(auth0.isAuthenticated)
  useEffect(() => {
    (async () => {
      if (!auth0.isAuthenticated || (invite == null && slug == null)) {
        return
      }

      const auth0Token = await auth0.getTokenSilently()

      const graphql = new GraphQL()

      let nextMachine
      if (invite == null && auth0Token != null) {
        const { cacheValuePromise } = await graphql.operate({
          fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
          operation: {
            query: `
              {
                my {
                  machines(slug: "${slug}") {
                    id
                    publicKey
                    name
                    slug
                  }
                }
              }
            `,
          },
        })

        const { data, httpError, graphQLErrors } = await cacheValuePromise

        console.log(data)
        if (data) {
          // eslint-disable-next-line prefer-destructuring
          nextMachine = data.my.machines[0]
          setMachine(nextMachine)
        } else {
          setError(graphQLErrors || httpError)
        }
      }

      console.log('con props??', auth0.isAuthenticated, auth0Token, nextMachine)
      try {
        if (
          auth0Token == null
          || (nextMachine == null && invite == null)
        ) {
          console.error('No machine or invite')
          setConnectionProps(null)
          return
        }

        const connectionPropsBuilder = {
          slug,
          authToken: auth0Token,
        }

        if (invite != null) {
          Object.assign(connectionPropsBuilder, invite)
        } else {
          Object.assign(connectionPropsBuilder, {
            identityKeys: await createECDHKey(),
            peerIdentityPublicKey: nextMachine.publicKey,
          })
        }

        setConnectionProps(connectionPropsBuilder)
      } catch (e) {
        setError(e)
      }
    })()
  }, [invite, slug, auth0.isAuthenticated])

  const graphql = useContext(GraphQLContext)

  const saveName = async (meta) => {
    if (invite != null || (machine && meta.name === machine.name)) {
      return
    }

    const auth0Token = await auth0.getTokenSilently()

    graphql.operate({
      fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
      operation: {
        query: `
          mutation($input: SetMachineName!) {
            setMachineName(input: $input) { id }
          }
        `,
        variables: {
          input: {
            id: machine.id,
            name: meta.name,
          },
        },
      },
    })
  }

  const createClient = () => {
    if (slug == null) {
      return { prevSlug: slug }
    }

    // console.log('con pros!', connectionProps)

    // The public key of the 3D machine. This uniquely identifies your 3D printer
    // and allows us to end-to-end encrypt everything you do with it. Usually
    // the public key is retreaved by scanning the QR Code displayed by Teg on
    // the 3D printer's screen.
    const thingLink = new ThingLink({
      // TODO: pass the invite key and/or auth0 token here
      createConnection: () => connect({
        // timeout: 1000,
        // identityKeys: myIdentity,
        // auth0Token: auth0Token,
        // inviteKey: inviteKey,
        identityKeys: connectionProps.identityKeys,
        authToken: connectionProps.authToken,
        peerIdentityPublicKey: connectionProps.peerIdentityPublicKey,
        // eslint-disable-next-line no-console
        onMeta: (meta) => {
          console.log('Received meta data', meta)
          saveName(meta)
        },
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
      prevSlug: slug,
    }
  }

  const clientRef = useRef({})

  const { prevSlug, link } = clientRef.current

  // console.log({ slug, connectionProps, auth0Token })


  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  // console.log({ prevSlug, slug, connectionProps, link })
  if (slug == null || (!auth0.loading && !auth0.isAuthenticated)) {
    return <>{ children }</>
  }

  if (!connectionProps || connectionProps.slug !== slug) {
    return <div />
  }

  if (prevSlug !== slug) {
    if (link != null) {
      link.client.close()
    }

    clientRef.current = createClient()
  }

  const { client } = clientRef.current

  return (
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        <TegApolloContext.Provider value={connectionProps}>
          <ConnectionStatus>
            { children }
          </ConnectionStatus>
        </TegApolloContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
