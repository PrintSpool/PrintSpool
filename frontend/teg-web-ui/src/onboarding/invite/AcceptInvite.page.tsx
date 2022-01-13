import React, { useEffect, useState } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import AcceptInviteView from './AcceptInvite.view'
import TegApolloProvider from '../../webrtc/TegApolloProvider'

const VERIFY_CONNECTION = gql`
  query {
    isConfigured
  }
`

// This component needs to be nested inside the TegApolloProvider to query the server
const AcceptInviteQueryWrapper = ({
  isConnecting,
  consumeInvite,
}) => {
  const [verifyConnection, query] = useLazyQuery(VERIFY_CONNECTION)

  useEffect(() => {
    if (isConnecting) {
      verifyConnection()
    }
  }, [isConnecting])

  if (query.error != null) {
    throw query.error;
  }

  return (
    <AcceptInviteView {...{
      consumeInvite,
      isPending: query.loading,
      isDone: query.data != null,
    }}/>
  )
}

const AcceptInvitePage = () => {
  const { invite } = useParams();
  const [isConnecting, setConnecting] = useState(false)

  return (
    <TegApolloProvider
      invite={isConnecting ? invite : null}
    >
      <AcceptInviteQueryWrapper {...{
        isConnecting,
        consumeInvite: () => setConnecting(true),
      }} />
    </TegApolloProvider>
  )
}

export default AcceptInvitePage
