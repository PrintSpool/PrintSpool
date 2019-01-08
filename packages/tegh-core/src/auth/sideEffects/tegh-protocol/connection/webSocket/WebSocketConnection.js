import EventEmitter from 'eventemitter3'

/*
 * creates a connection to a peer through a websocket
 */
const WebsocketConnection = ({
  websocket,
  // TODO: filter the websocket down to just the peer
  peerIdentityPublicKey,
} = {}) => async ({
  sessionID,
}) => {
  const nextConnection = EventEmitter()
  Object.assign(nextConnection, {
    sessionID,
    send: async (data) => {
      websocket.send(data)
    },
    close: () => {
      websocket.close()
    },
  })

  // eslint-disable-next-line no-param-reassign
  websocket.onmessage = (data) => {
    nextConnection.emit('data', data)
  }

  // eslint-disable-next-line no-param-reassign
  websocket.onerror = (error) => {
    nextConnection.emit('error', error)
  }

  // eslint-disable-next-line no-param-reassign
  websocket.onclose = () => {
    nextConnection.emit('close')
  }

  return nextConnection
}

export default WebsocketConnection
