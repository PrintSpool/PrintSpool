import { WebSocketLink } from 'apollo-link-ws'

import wrapInSocketAPI from './wrapInSocketAPI'

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
  const socketImpl = wrapInSocketAPI(params)

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
