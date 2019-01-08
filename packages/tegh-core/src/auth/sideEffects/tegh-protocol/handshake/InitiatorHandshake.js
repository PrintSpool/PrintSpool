import { createECDHKey } from '../p2pCrypto/keys'
import handshakeReqMessage from '../messages/handshakeReqMessage'

import waitForHandshakeRes from './waitForHandshakeRes'

const InitiatorHandshake = ({
  identityKeys,
  peerIdentityPublicKey,
}) => async ({
  currentConnection,
}) => {
  const { sessionID } = currentConnection
  const ephemeralKeys = await createECDHKey()

  await currentConnection.send(handshakeReqMessage({
    identityKeys,
    ephemeralKeys,
    sessionID,
  }))

  const { sessionKey } = await waitForHandshakeRes({
    currentConnection,
    peerIdentityPublicKey,
    identityKeys,
    ephemeralKeys,
  })

  return {
    initiator: true,
    currentConnection,
    sessionID,
    sessionKey,
  }
}

export default InitiatorHandshake
