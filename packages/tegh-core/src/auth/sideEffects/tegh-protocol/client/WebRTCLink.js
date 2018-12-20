import { WebSocketLink } from 'apollo-link-ws'

import sendHandshakeRequest from '../handshake/sendHandshakeRequest'
import createWebRTCSocket from '../webRTC/createWebRTCSocket'

const WebRTCLink = async ({
  datPeers,
  identityKeys,
  peerIdentityPublicKey,
  wrtc,
}) => {
  const datPeer = await datPeers.get(peerIdentityPublicKey)

  const {
    ephemeralKeys,
    request,
  } = await sendHandshakeRequest({ identityKeys, datPeer })

  // TODO: waitForHandshakeResponse
  const { sessionKey } = await waitForHandshakeResponse({
    datPeer,
    identityKeys,
    ephemeralKeys,
  })

  const { socketImpl } = await createWebRTCSocket({
    datPeer,
    sessionID: request.sessionID,
    sessionKey,
    initiator: true,
    wrtc,
  })

  const webRTCLink = new WebSocketLink({
    uri: 'wss://example.com',
    options: {
      reconnect: true,
    },
    webSocketImpl: socketImpl,
  })

  return webRTCLink
}

export default WebRTCLink
