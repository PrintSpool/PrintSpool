import { WebSocketLink } from 'apollo-link-ws'

import createWebRTCSocket from '../webRTC/createWebRTCSocket'

const WebRTCLink = async ({
  handshake,
  wrtc,
}) => {
  const {
    initiator,
    datPeer,
    sessionID,
    sessionKey,
  } = await handshake

  const { socketImpl } = await createWebRTCSocket({
    datPeer,
    sessionID,
    sessionKey,
    initiator,
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
