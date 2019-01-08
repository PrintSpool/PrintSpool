import eventTrigger from '../eventTrigger'
import parseHandshakeRes from './parseHandshakeRes'

const waitForHandshakeRes = async ({
  currentConnection,
  peerIdentityPublicKey,
  identityKeys,
  ephemeralKeys,
}) => {
  const {
    response,
    sessionKey,
  } = await eventTrigger(currentConnection, 'data', {
    map: (peer, message) => {
      if (message.identityPublicKey !== peerIdentityPublicKey) {
        return null
      }

      try {
        return parseHandshakeRes({
          response,
          identityKeys,
          ephemeralKeys,
        })
      } catch {
        /*
         * exceptions may be caused by MITM attacks with invalid data so ignore
         * them all.
         */
        return null
      }
    },
    filter: result => result != null,
  })

  return {
    response,
    sessionKey,
  }
}

export default waitForHandshakeRes
