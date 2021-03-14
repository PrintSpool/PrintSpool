import React, {
  useContext,
  useEffect,
  useState,
} from 'react'
import { ApolloProvider, ApolloClient, InMemoryCache, DefaultOptions } from '@apollo/client';

import useReactRouter from 'use-react-router'
import DetectRTC from 'detectrtc'
// import { ApolloLink } from 'apollo-link'
// import { onError } from 'apollo-link-error'
import { GraphQLContext } from 'graphql-react'
import UnsupportedBrowser from '../UnsupportedBrowser'
import ConnectionStatus from './ConnectionStatus'
import { useAuth } from '../common/auth'
import { useAsync } from 'react-async'

import WebRTCLink, { INSECURE_LOCAL_CONNECTION } from './WebRTCLink'

export const TegApolloContext = React.createContext(null)

const TegApolloProvider = ({
  children,
  slug: slugParam,
}: {
  children: any,
  slug?: string,
}) => {
  const { location, match } = useReactRouter()
  const { isSignedIn, fetchOptions } = useAuth()

  const [link, setLink] = useState(null as any)
  const [iceServers, setIceServers] = useState(null as any)
  const [signallingError, setSignallingError] = useState(null as any)
  // const [closedBy, setClosedBy] = useState(null)

  const params = new URLSearchParams(location.search)
  const invite = params.get('invite')

  const hostSlug = slugParam || (match as any).params.hostID || params.get('q')

  const shouldConnect = isSignedIn && (invite != null || hostSlug != null)

  const unsupportedBrowser = shouldConnect && !INSECURE_LOCAL_CONNECTION && (
    RTCPeerConnection.prototype.createDataChannel == null
    || DetectRTC.browser.name.includes('FB_IAB')
  )

  useEffect(() => {
    setSignallingError(null)
  }, [hostSlug, invite])

  // console.log({ invite, match, params, slug })
  const graphql: any = useContext(GraphQLContext)

  const querySignalling = async (operation) => {
    const { cacheValuePromise } = await graphql.operate({
      fetchOptionsOverride: fetchOptions,
      operation,
    })

    const { data, graphQLErrors, fetchError } = await cacheValuePromise

    if (graphQLErrors != null) {
      throw new Error(graphQLErrors[0].message)
    }

    if (fetchError != null) {
      console.warn({ fetchError })
      throw new Error(
        "Unnable to connect. Please verify that your internet is working."
      )
    }

    return data
  }

  const clientDefaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  };

  const createWebRTCLink = async () => {
    const { iceServers: nextIceServers } = await querySignalling({
      query: `
        {
          iceServers {
            url
            urls
            username
            credential
          }
        }
      `,
    })

    setIceServers(nextIceServers)

    const nextLink = new WebRTCLink({
      defaultOption: clientDefaultOptions,
      iceServers: nextIceServers,
      connectToPeer: async (offer) => {
        console.log('Connecting to signalling server...')

        const { connectToHost } = await querySignalling({
          query: `
            mutation($input: ConnectToHostInput!) {
              connectToHost(input: $input) {
                response {
                  answer
                  iceCandidates
                }
              }
            }
          `,
          variables: {
            input: {
              hostSlug,
              invite,
              offer,
            },
          },
        })

        console.log('Connecting to signalling server... [DONE]')

        return connectToHost.response
      },
      onSignallingError: setSignallingError,
      onSignallingSuccess: () => {
        setSignallingError(null)
      },
      // onClose: (e) => {
      //   setClosedBy({
      //     timestamp: Date.now(),
      //     link: nextLink,
      //     message: e.message,
      //   })
      // },
    })

    return nextLink
  }

  const client = useAsync({
    deferFn: async () => {
      console.log('apollo client inputs', { shouldConnect, invite, hostSlug, isSignedIn })

      let nextLink
      if (INSECURE_LOCAL_CONNECTION) {
        // Open a Websocket connection to the server.
        //
        // WebRTCLink internally switches to WebSockets when INSECURE_LOCAL_CONNECTION is true.
        // nextLink = new WebRTCLink()
        return new ApolloClient({
          uri: process.env.INSECURE_LOCAL_HTTP_URL,
          cache: new InMemoryCache(),
          defaultOptions: clientDefaultOptions,
        })
      } else {
        nextLink = await createWebRTCLink()
      }

      (link?.client || link)?.dispose()
      setLink(nextLink)

      return new ApolloClient({
        cache: new InMemoryCache(),
        link: nextLink,
      })
    },
  })

  useEffect(() => {
    if (shouldConnect && !unsupportedBrowser) {
      client.run()
    }
  }, [invite, hostSlug, isSignedIn])

  // useEffect(() => {
  //   if (shouldConnect && !unsupportedBrowser && closedBy != null && closedBy.link === link) {
  //     client.run()
  //   }
  // }, [closedBy?.timestamp])

  if (unsupportedBrowser) {
    return <UnsupportedBrowser />
  }

  if (!shouldConnect) {
    return <>{ children }</>
  }

  if (signallingError || client.error) {
    return (
      <ConnectionStatus error={signallingError || client.error} />
    )
  }

  if (!client.isResolved) {
    return <div />
  }
  console.log('apollo client', client, { iceServers })

  return (
    <ApolloProvider client={client.data as any}>
      <TegApolloContext.Provider
        value={{
          iceServers,
        }}
      >
        { children }
      </TegApolloContext.Provider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
