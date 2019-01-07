import { WebSocketLink } from 'apollo-link-ws'

import upgradeToWebRTCConnection from '../webRTC/upgradeToWebRTCConnection'
import wrapInSocketAPI from './wrapInSocketAPI'

const WebRTCLink = async ({
  handshake,
  wrtc = null,
  upgradeToWebRTC = true,
}) => {
  const socketImpl = wrapInSocketAPI(async (url, protocol) => {
    let connection
    // create the handshake connection
    connection = await handshake
    // upgrade to a webrtc connection
    if (upgradeToWebRTC) {
      connection = await upgradeToWebRTCConnection({
        currentConnection: connection,
        wrtc,
        protocol,
      })
    }

    return connection
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
