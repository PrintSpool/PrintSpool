import { WebSocketLink } from 'apollo-link-ws'

import randomBytes from '../p2pCrypto/randomBytes'
import upgradeToWebRTCConnection from '../webRTC/upgradeToWebRTCConnection'
import wrapInSocketAPI from './wrapInSocketAPI'

const WebRTCLink = async (connectionPath) => {
  const socketImpl = wrapInSocketAPI(async (url, protocol) => {
    // TODO: attach the session ID to the connection
    const sessionID = await randomBytes(32)

    let connection

    connectionPath.reduce((previousConnectionPromise, nextConnectionFn) => {
      nextConnectionFn({
        currentConnection,
        sessionID,
      })
    }, null)
    // create the handshake connection
    connection = await handshake({

      sessionID,
    })
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
