import EventEmitter from 'eventemitter3'

/*
 * Events: 'data', 'error', 'close'
 */
const Connection = ({
  sessionID,
  send,
  close,
}) => {
  const connection = EventEmitter()

  Object.assign(connection, {
    sessionID,
    send,
    close,
  })

  return connection
}

export default Connection
