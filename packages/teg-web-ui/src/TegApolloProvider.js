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

import { useGraphQL, GraphQLContext } from 'graphql-react'

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

const TegApolloProvider = ({
  children,
}) => {
  const { location, match } = useReactRouter()
  const auth0 = useAuth0()
  const [auth0Token, setAuth0Token] = useState()
  let [error, setError] = useState()

  useEffect(() => {(async () => {
    if (auth0.isAuthenticated) {
      const nextAuth0Token = await auth0.getTokenSilently()
      setAuth0Token(nextAuth0Token)
    } else {
      setAuth0Token(null)
    }
  })()}, [auth0.isAuthenticated])

  const params = new URLSearchParams(location.search)

  const inviteCode = params.get('invite')
  const invite = useMemo(() => {
    if (inviteCode != null) {
      return parseInviteCode(base64url.toBase64(inviteCode))
    }
  }, [inviteCode])

  // console.log({ inviteCode, invite, match, params })
  const slug = (invite && getID(invite)) || match.params.hostID || params.get('q')

  const { load, loading, cacheValue = {} } = useGraphQL({
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
      `
    },
  })

  // onSubscriptionData={({ subscriptionData }) => {
  //   setHostName({
  //     machineSlug,
  //     name: subscriptionData.data.jobQueue.name,
  //   })
  // }}


  useEffect(() => {
    if (invite == null && auth0Token != null) {
      load()
    }
  }, [invite, auth0Token])

  const { data, httpError, graphQLErrors } = cacheValue

  const machine = data && data.my.machines[0]

  const graphql = useContext(GraphQLContext)

  const saveName = (meta) => {
    if (invite != null || meta.name === machine.name) {
      return
    }

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
          }
        }
      },
    })
  }


  const [connectionProps, setConnectionProps] = useState()

  useEffect(() => {
    (async () => {
      // console.log(auth0.isAuthenticated, auth0Token, machine)
      try {
        if (
          !auth0.isAuthenticated
          || auth0Token == null
          || (invite == null && (machine && machine.slug) !== slug)
        ) {
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
            peerIdentityPublicKey: machine.publicKey,
          })
        }

        setConnectionProps(connectionPropsBuilder)
      } catch (e) {
        setError(e)
      }
    })()
  }, [location, match, auth0Token, auth0.isAuthenticated, machine])

  error = error || graphQLErrors || httpError

  const createClient = () => {
    if (slug == null) {
      return { prevSlug: slug }
    }

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
    return (
      <div>
        <Typography variant="h6" paragraph>
          Something went wrong. Here's what we know:
        </Typography>
        <pre>
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }

  if (
    slug != null
    && (connectionProps && connectionProps.slug) !== slug
  ) {
    return <div />
  }

  if (prevSlug !== slug) {
    if (link != null) {
      link.client.close()
    }

    clientRef.current = createClient()
  }

  const { client } = clientRef.current

  // console.log({ slug })
  if (slug == null) {
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
