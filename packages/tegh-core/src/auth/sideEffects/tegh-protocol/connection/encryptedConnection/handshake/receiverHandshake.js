import { createECDHKey, createSessionKey } from '../p2pCrypto/keys'

import handshakeResMessage from '../messages/handshakeResMessage'
import { validateHandshakeReq } from '../messages/handshakeReqMessage'

const receiverHandshake = async ({
  currentConnection,
  identityKeys,
  peerIdentityPublicKey,
  request,
}) => {
  validateHandshakeReq(request)

  const ephemeralKeys = await createECDHKey()

  const sessionKey = await createSessionKey({
    isHandshakeInitiator: false,
    identityKeys,
    ephemeralKeys,
    peerIdentityPublicKey,
    peerEphemeralPublicKey: request.ephemeralPublicKey,
  })

  const response = handshakeResMessage({
    sessionID: currentConnection.sessionID,
    identityKeys,
    ephemeralKeys,
  })

  await currentConnection.send(response)

  return {
    sessionKey,
  }
}

export default receiverHandshake
