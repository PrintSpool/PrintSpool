import React, {
  useEffect,
  useState,
} from 'react'
import { ApolloProvider, ApolloClient, InMemoryCache, DefaultOptions } from '@apollo/client';

import useReactRouter from 'use-react-router'
import DetectRTC from 'detectrtc'
// import { ApolloLink } from 'apollo-link'
// import { onError } from 'apollo-link-error'
import UnsupportedBrowser from '../UnsupportedBrowser'
import ConnectionStatus from './ConnectionStatus'
import { useAuth } from '../common/auth'
import { useAsync } from 'react-async'

import WebRTCLink, { INSECURE_LOCAL_CONNECTION } from './WebRTCLink'
import { wsBridgeURL } from '../common/auth/signallingFetchOptions';

const TegApolloProvider = ({
  children,
  slug: slugParam,
}: {
  children: any,
  slug?: string,
}) => {
  const { location, match } = useReactRouter()
  const { isSignedIn, getIdToken } = useAuth()

  const [link, setLink] = useState(null as any)
  const [signallingError, setSignallingError] = useState(null as any)
  // The re-render key is used to force polling queries to restart after a connection
  // interuption. Without this they stop polling forever.
  const [rerenderKey, setRerenderKey] = useState(0)

  const params = new URLSearchParams(location.search)
  const invite = params.get('invite')

  let hostSlug = slugParam || (match as any).params.hostID || params.get('q')

  if (hostSlug == 'get-started') {
    hostSlug = null
  }

  const reservedRoutes = [
    'privacy-policy',
    'login',
    'i',
    'account',
  ]

  const shouldConnect = (
    isSignedIn
    && (invite != null || hostSlug != null)
    && !reservedRoutes.includes(hostSlug)
  )

  const unsupportedBrowser = shouldConnect && !INSECURE_LOCAL_CONNECTION && (
    RTCPeerConnection.prototype.createDataChannel == null
    || DetectRTC.browser.name.includes('FB_IAB')
  )

  useEffect(() => {
    setSignallingError(null)
  }, [hostSlug, invite])

  // console.log({ invite, match, params, slug })

  const clientDefaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  };

  const client = useAsync({
    deferFn: async () => {
      // console.log('apollo client inputs', { shouldConnect, invite, hostSlug, isSignedIn })

      let nextClient = null
      if (INSECURE_LOCAL_CONNECTION) {
        // Open a Websocket connection to the server.
        //
        // WebRTCLink internally switches to WebSockets when INSECURE_LOCAL_CONNECTION is true.
        // nextLink = new WebRTCLink()
        nextClient = new ApolloClient({
          uri: process.env.INSECURE_LOCAL_HTTP_URL,
          cache: new InMemoryCache(),
          defaultOptions: clientDefaultOptions,
        })
      } else {
        const previousLink = link?.client || link
        previousLink?.dispose()

        const nextLink = new WebRTCLink({
          defaultOption: clientDefaultOptions,
          url: wsBridgeURL({
            hostSlug,
            invite,
            authorization: await getIdToken(),
          }),
          onSignallingSuccess: () => {
            setRerenderKey(i => i + 1)
            setSignallingError(null)
          },
          onSignallingError: setSignallingError,
        })

        setLink(nextLink)

        nextClient =  new ApolloClient({
          cache: new InMemoryCache(),
          link: nextLink,
        })
      }

      return nextClient
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
  // console.log('apollo client', rerenderKey, client.data, { iceServers })

  return (
    <ApolloProvider client={client.data as any} key={rerenderKey.toString()}>
      { children }
    </ApolloProvider>
  )
}

export default TegApolloProvider
