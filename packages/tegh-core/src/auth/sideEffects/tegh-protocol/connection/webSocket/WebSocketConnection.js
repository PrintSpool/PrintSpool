import Connection from '../Connection'

const OPEN = 1

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
  const nextConnection = Connection({
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

  if (websocket.readyState !== OPEN) {
    // wait for the websocket to open
    await new Promise((resolve, reject) => {
      nextConnection.on('error', reject)
      // eslint-disable-next-line no-param-reassign
      websocket.onopen = () => {
        nextConnection.removeListener('error', reject)
        resolve()
      }
    })
  }

  return nextConnection
}

export default WebsocketConnection
