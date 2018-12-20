import eventTrigger from '../eventTrigger'
import parseHandshakeRes from './parseHandshakeRes'

const waitForHandshakeRes = async ({
  datPeers,
  datPeer,
  peerIdentityPublicKey,
  sessionID,
  identityKeys,
  ephemeralKeys,
}) => {
  const {
    response,
    sessionKey,
  } = await eventTrigger(datPeers, 'message', {
    map: (peer, message) => {
      if (
        peer.id !== datPeer.id
        || message.identityPublicKey !== peerIdentityPublicKey
        || message.sessionID !== sessionID
      ) {
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
