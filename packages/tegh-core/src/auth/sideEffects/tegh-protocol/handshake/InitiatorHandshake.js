import sendHandshakeReq from './sendHandshakeReq'
import waitForHandshakeRes from './waitForHandshakeRes'

const InitiatorHandshake = async ({
  datPeers,
  identityKeys,
  peerDatID,
  peerIdentityPublicKey,
}) => {
  const datPeer = await datPeers.get(peerDatID)

  const {
    ephemeralKeys,
    request,
  } = await sendHandshakeReq({ identityKeys, datPeer })

  const { sessionID } = request

  const { sessionKey } = await waitForHandshakeRes({
    datPeers,
    datPeer,
    peerIdentityPublicKey,
    sessionID,
    identityKeys,
    ephemeralKeys,
  })

  return {
    initiator: true,
    datPeer,
    sessionID,
    sessionKey,
  }
}

export default InitiatorHandshake
