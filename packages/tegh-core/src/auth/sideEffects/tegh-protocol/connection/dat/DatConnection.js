import Connection from '../Connection'
import createDatPeerNetwork from './createDatPeerNetwork'

const DatConnection = ({
  peer,
  peers,
  ...params
} = {}) => async ({
  sessionID,
}) => {
  let { network } = params

  if (network == null) {
    network = createDatPeerNetwork({ peers })
  }

  const key = { peerID: peer.id, sessionID }

  // events: data, error
  const nextConnection = Connection({
    sessionID,
    send: data => peer.send(data),
    close: () => {
      network.removeListener(key)
      nextConnection.emit('close')
    },
  })

  network.listenFor(key, (data) => {
    nextConnection.emit('data', data)
  })

  return nextConnection
}

export default DatConnection
