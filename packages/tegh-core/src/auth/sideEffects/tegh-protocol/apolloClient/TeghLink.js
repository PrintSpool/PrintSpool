import { WebSocketLink } from 'apollo-link-ws'

import randomBytes from '../p2pCrypto/randomBytes'
import upgradeToWebRTCConnection from '../webRTC/upgradeToWebRTCConnection'
import wrapInSocketAPI from './wrapInSocketAPI'
import ConnectionPath from './connectionPath'

/*
 * params:
 *  - sessionID
 *  - connectionPath
 *
 * If connectionPath is ommitted then the parameters for a new
 * ConnectionPath can be sent in the params
 */
const WebRTCLink = async (params) => {
  const socketImpl = wrapInSocketAPI(async (url, protocol) => {
    // TODO: attach the session ID to the connection
    const {
      sessionID = await randomBytes(32),
      connectionPath = ConnectionPath(params),
    } = params

    let connection

    connectionPath.reduce((previousConnectionPromise, nextConnectionFn) => {
      nextConnectionFn({
        currentConnection,
        sessionID,
      })
    }, null)

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
