import { createECDHKey, createSessionKey } from '../p2pCrypto/keys'

import eventTrigger from '../eventTrigger'


import handshakeReqMessage from '../messages/handshakeReqMessage'
import { validateHandshakeRes } from '../messages/handshakeResMessage'

const initiatorHandshake = async ({
  currentConnection,
  identityKeys,
  peerIdentityPublicKey,
}) => {
  const { sessionID } = currentConnection

  const ephemeralKeys = await createECDHKey()

  await currentConnection.send(handshakeReqMessage({
    identityKeys,
    ephemeralKeys,
    sessionID,
  }))

  /*
   * wait for a vaild handshake response
   */
  const sessionKey = await eventTrigger(currentConnection, 'data', {
    filter: result => result != null,
    map: async (response) => {
      try {
        validateHandshakeRes(response)

        const key = await createSessionKey({
          isHandshakeInitiator: true,
          identityKeys,
          ephemeralKeys,
          peerIdentityPublicKey,
          peerEphemeralPublicKey: response.ephemeralPublicKey,
        })

        return key
      } catch {
        /*
         * invalid messages may be caused by MITM attacks with invalid data so
         * ignore them all.
         */
      }
    },
  })

  return {
    sessionKey,
  }
}

export default initiatorHandshake
