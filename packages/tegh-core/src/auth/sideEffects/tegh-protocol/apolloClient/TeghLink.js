import { WebSocketLink } from 'apollo-link-ws'

import randomBytes from '../p2pCrypto/randomBytes'
import wrapInSocketAPI from './wrapInSocketAPI'
import ConnectionPath from './ConnectionPath'
import connect from '../connection/connect'

/*
 * params:
 *  - sessionID
 *  - connectionPath
 *  - options
 *
 * If connectionPath is ommitted then the parameters for a new
 * ConnectionPath can be sent in the params
 */
const TeghLink = async (params) => {
  const socketImpl = wrapInSocketAPI(async ({ protocol, socket }) => {
    // TODO: attach the session ID to the connection
    const {
      sessionID = await randomBytes(32),
      connectionPath = ConnectionPath(params),
    } = params

    const connection = await connect({
      protocol,
      sessionID,
      connectionPath,
      socket,
    })

    return connection
  })

  const defaultOptions = {
    reconnect: true,
  }
  const options = Object.assign(defaultOptions, params.options || {})

  const webRTCLink = new WebSocketLink({
    uri: 'wss://example.com',
    options,
    webSocketImpl: socketImpl,
  })

  return webRTCLink
}

export default TeghLink
