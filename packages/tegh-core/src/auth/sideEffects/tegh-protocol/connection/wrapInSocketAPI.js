import EventEmitter from 'eventemitter3'

import randomBytes from '../p2pCrypto/randomBytes'
import ConnectionPath from './ConnectionPath'
import connect from './connect'

export const SOCKET_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}

/*
 * params:
 *  - sessionID
 *  - connectionPath
 *
 * If connectionPath is ommitted then the parameters for a new
 * ConnectionPath can be sent in the params
 */

const wrapInSocketAPI = (params) => {
  let connection = null
  const socket = Object.assign(new EventEmitter(), {
    readyState: SOCKET_STATES.CONNECTING,
    send: (data) => {
      if (socket.readyState !== SOCKET_STATES.OPEN) {
        throw new Error('Cannot call send on a closed connection')
      }
      connection.send(data)
    },
    close: () => {
      // eslint-disable-next-line no-console
      console.log('close socket')
      if (connection != null) {
        connection.close()
      } else {
        socket.readyState = SOCKET_STATES.CLOSED
      }
    },
  })

  const onError = (error) => {
    socket.readyState = SOCKET_STATES.CLOSED

    if (socket.onerror == null && socket.listenerCount('error' === 0)) {
      throw new Error(error)
    }
    if (socket.onerror != null) {
      socket.onerror(error)
    }
    socket.emit('error', error)
  }

  const shouldAbortConnection = () => (
    socket.readyState !== SOCKET_STATES.CONNECTING
  )

  const onConnection = (nextConnection) => {
    if (shouldAbortConnection()) {
      nextConnection.close()
      return
    }

    connection = nextConnection

    // set the state and relay an open event through the socket
    socket.readyState = SOCKET_STATES.OPEN

    if (socket.onopen != null) {
      socket.onopen()
    }

    socket.emit('open')

    // relay connection events through the socket API
    connection.on('data', (data) => {
      socket.onmessage({ data })
    })

    connection.on('close', () => {
      socket.readyState = SOCKET_STATES.CLOSED
      if (socket.onclose != null) {
        socket.onclose()
      }
      socket.emit('close')
    })

    connection.on('error', onError)
  }

  /*
   * mimic the websocket API
   */
  const socketImpl = (url, protocol) => {
    (async () => {
      try {
        const {
          sessionID = await randomBytes(32),
          connectionPath = ConnectionPath(params),
        } = params

        socket.sessionID = sessionID

        const nextConnection = await connect({
          connectionPath,
          sessionID,
          protocol,
          shouldAbortConnection,
        })
        onConnection(nextConnection)
      } catch (e) {
        onError(e)
      }
    })()

    return socket
  }

  // socketImpl is a websocket-compatible API
  Object.assign(socketImpl, SOCKET_STATES)

  return socketImpl
}

export default wrapInSocketAPI
