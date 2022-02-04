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
  onComplete,
}) => {
  const [verifyConnection, query] = useLazyQuery(VERIFY_CONNECTION)

  useEffect(() => {
    verifyConnection()
  }, [])

  if (query.error != null) {
    throw query.error;
  }
  console.log({ data: query.data})

  useEffect(() => {
    if (query.data != null) {
      onComplete()
    }
  }, [query.data != null])

  return <div/>
}

const AcceptInvitePage = () => {
  const { invite } = useParams();
  const [isConnecting, setConnecting] = useState(false)
  const [isDone, setDone] = useState(false)

  return (
    <TegApolloProvider
      invite={isConnecting ? invite : null}
    >
      <div>
        {isConnecting &&
          <AcceptInviteQueryWrapper {...{
            onComplete: () => {
              setDone(true);
              setConnecting(false);
            }
          }} />
        }
        <AcceptInviteView {...{
          consumeInvite: () => setConnecting(true),
          isPending: isConnecting,
          isDone,
        }}/>
      </div>
    </TegApolloProvider>
  )
}

export default AcceptInvitePage
