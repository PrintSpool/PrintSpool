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
import DetectRTC from 'detectrtc'
// import { ApolloLink } from 'apollo-link'
// import { onError } from 'apollo-link-error'

import { GraphQL, GraphQLContext } from 'graphql-react'

import base64url from 'base64url'

// import { ThingLink, connect, parseInviteCode } from 'graphql-things/client'
import {
  ThingLink,
  connect,
  parseInviteCode,
  createECDHKey,
} from 'graphql-things'

import UnsupportedBrowser from './UnsupportedBrowser'
import { getID } from './UserDataProvider'
import ConnectionStatus from './common/ConnectionStatus'
import { useAuth } from './common/auth'

export const TegApolloContext = React.createContext(null)

const TegApolloProvider = ({
  children,
  slug: slugParam,
}) => {
  const { location, match } = useReactRouter()
  const { isSignedIn, fetchOptions, idToken } = useAuth()

  const [error, setError] = useState()
  const [connectionProps, setConnectionProps] = useState()
  const [{ machine, iceServers }, setUserProfileData] = useState({})

  const params = new URLSearchParams(location.search)
  const inviteCode = params.get('invite')

  const invite = useMemo(() => {
    if (inviteCode != null) {
      return parseInviteCode(base64url.toBase64(inviteCode))
    }
  }, [inviteCode])

  const slug = slugParam || (invite && getID(invite)) || match.params.hostID || params.get('q')
  console.log( { slug })

  const shouldConnect = isSignedIn && (invite != null || slug != null)

  const unsupportedBrowser = shouldConnect && (
    RTCPeerConnection.prototype.createDataChannel == null
    || DetectRTC.browser.name.includes('FB_IAB')
  )

  // console.log({ inviteCode, invite, match, params, slug })

  // console.log(auth0.isAuthenticated)
  useEffect(() => {
    (async () => {
      if (!shouldConnect || unsupportedBrowser) {
        return
      }

      const graphql = new GraphQL()

      let nextMachine

      const { cacheValuePromise } = await graphql.operate({
        fetchOptionsOverride: fetchOptions,
        operation: {
          query: `
            {
              ${invite == null ? (`
                my {
                  machines(slug: "${slug}") {
                    id
                    publicKey
                    name
                    slug
                  }
                }
              `) : ''}
              iceServers {
                url
                urls
                username
                credential
              }
            }
          `,
        },
      })

      const { data, ...errors } = await cacheValuePromise

      console.log(data)
      if (data) {
        console.log('user profile data', data)
        // eslint-disable-next-line prefer-destructuring
        nextMachine = invite == null ? data.my.machines[0] : null
        setUserProfileData({
          machine: nextMachine,
          iceServers: data.iceServers,
        })
      } else {
        setError(errors)
        return
      }

      console.log('machine??', { hasIdToken: idToken != null, nextMachine, invite })
      try {
        if (
          idToken == null
          || (nextMachine == null && invite == null)
        ) {
          setError('No machine or invite')
          setConnectionProps(null)
          return
        }

        const connectionPropsBuilder = {
          slug,
          authToken: idToken,
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
  }, [invite, slug, isSignedIn])

  const graphql = useContext(GraphQLContext)

  const saveName = async (meta) => {
    if (invite != null || (machine && meta.name === machine.name)) {
      return
    }

    graphql.operate({
      fetchOptionsOverride: fetchOptions,
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

    // The public key of the 3D printer. This uniquely identifies your 3D printer
    // and allows us to end-to-end encrypt everything you do with it. Usually
    // the public key is retreaved by scanning the QR Code displayed by Teg on
    // the 3D printer's screen.
    const thingLink = new ThingLink({
      // TODO: pass the invite key and/or auth0 token here
      createConnection: () => connect({
        // timeout: 1000,
        // identityKeys: myIdentity,
        // idToken: idToken,
        // inviteKey: inviteKey,
        iceServers,
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

    // const errorLink = onError(({ graphQLErrors }) => {
    //   // eslint-disable-next-line no-console
    //   console.error('Unexpected GraphQL Errors', graphQLErrors)
    // })

    const nextClient = new ApolloClient({
      // link: ApolloLink.from([
      //   // new ReduxLink(store),
      //   errorLink,
      //   thingLink,
      // ]),
      link: thingLink,
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

  // console.log({ slug, connectionProps, idToken })

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (unsupportedBrowser) {
    return <UnsupportedBrowser />
  }

  console.log({ prevSlug, slug, connectionProps, link })
  if (slug == null || !isSignedIn) {
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
  console.log({ client })

  return (
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        <TegApolloContext.Provider
          value={{
            ...connectionProps,
            iceServers,
          }}
        >
          <ConnectionStatus>
            { children }
          </ConnectionStatus>
        </TegApolloContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
