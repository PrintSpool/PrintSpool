import EventEmitter from 'eventemitter3'

// export const connect = async (connections, {
//   it
// }) => {
//   // execute the connection upgrades in sequence
//   await connections.reduce((conA, conB) => conA.then(conB))
// }

/*
 * Events: 'data', 'error', 'close'
 */
const Connection = ({
  initiator,
}) => {
  const connection = new EventEmitter()

  Object.assign(connection, {
    initiator,
  })

  return connection
}

export default Connection
