import React, {
  useContext,
  useEffect,
  useState,
} from 'react'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

import useReactRouter from 'use-react-router'
import DetectRTC from 'detectrtc'
// import { ApolloLink } from 'apollo-link'
// import { onError } from 'apollo-link-error'
import { GraphQL, GraphQLContext } from 'graphql-react'
import UnsupportedBrowser from '../UnsupportedBrowser'
import ConnectionStatus from '../common/ConnectionStatus'
import { useAuth } from '../common/auth'
import { useAsync } from 'react-async'

import WebRTCLink from './WebRTCLink'

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
  const [link, setLink] = useState(null) as any

  const params = new URLSearchParams(location.search)
  const invite = params.get('invite')

  const hostSlug = slugParam || (match as any).params.hostID || params.get('q')

  const shouldConnect = isSignedIn && (invite != null || hostSlug != null)

  const unsupportedBrowser = shouldConnect && (
    RTCPeerConnection.prototype.createDataChannel == null
    || DetectRTC.browser.name.includes('FB_IAB')
  )

  // console.log({ invite, match, params, slug })
  const graphql: any = useContext(GraphQLContext)

  const querySignalling = async (operation) => {
    const { cacheValuePromise } = await graphql.operate({
      fetchOptionsOverride: fetchOptions,
      operation,
    })

    const { data, errors } = await cacheValuePromise

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2))
    }

    return data
  }

  const iceServersAsync = useAsync({
    deferFn: async () => {
      if (!shouldConnect || unsupportedBrowser) {
        return
      }

      const { iceServers } = await querySignalling({
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

      return iceServers
    }
  })

  const client = useAsync({
    deferFn: async () => {
      console.log({ shouldConnect, invite, hostSlug, isSignedIn })

      iceServersAsync.run()
      const iceServers = await iceServersAsync.promise

      const nextLink = new WebRTCLink({
        iceServers,
        connectToPeer: async (offer) => {
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

          connectToHost.response
        }
      })

      link.dispose()
      setLink(nextLink)
      new ApolloClient({
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

  if (client.error) {
    throw client.error
  }

  if (unsupportedBrowser) {
    return <UnsupportedBrowser />
  }

  if (!shouldConnect) {
    return <>{ children }</>
  }

  if (client.isPending) {
    return <div />
  }

  return (
    <ApolloProvider client={client.data as any}>
      <TegApolloContext.Provider
        value={{
          iceServers: iceServersAsync.data,
        }}
      >
        <ConnectionStatus>
          { children }
        </ConnectionStatus>
      </TegApolloContext.Provider>
    </ApolloProvider>
  )
}

export default TegApolloProvider
