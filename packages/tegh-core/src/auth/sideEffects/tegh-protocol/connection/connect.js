import { SOCKET_STATES } from '../apolloClient/wrapInSocketAPI'

const connect = ({
  connectionPath,
  sessionID,
  socket,
}) => {
  const connectionReducer = (currentConnectionPromise, nextConnectionFn) => (
    currentConnectionPromise.then(async (currentConnection) => {
      const nextConnection = await nextConnectionFn({
        currentConnection,
        sessionID,
      })

      if (socket.status !== SOCKET_STATES.CONNECTING) {
        nextConnection.close()
        // if the socket has been closed then stop the connection process
        return null
      }

      return nextConnection
    })
  )
  return connectionPath.reduce(connectionReducer, Promise.resolve(null))
}

export default connect
