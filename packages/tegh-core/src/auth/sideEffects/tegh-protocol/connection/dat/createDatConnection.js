import EventEmitter from 'eventemitter3'
import createDatPeerNetwork from './createDatPeerNetwork'

import {
  DAT_PEERS_URL,
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  DATA,
  MESSAGE_TYPES,
  MESSAGE_PROTOCOL_VERSION,
} from '../handshake/constants'

const createDatConnection = async ({
  peer,
  peers,
  sessionID,
  initiator,
  identityKeys,
  peerIdentityPublicKey,
  ...params
}) => {
  let { network } = params

  if (network == null) {
    network = createDatPeerNetwork({ peers })
  }

  const key = { peerID: peer.id, sessionID }

  // events: data, error
  const nextConnection = EventEmitter()
  Object.assign(nextConnection, {
    send: data => peer.send(data),
    close: () => {
      network.removeListener(key)
    },
  })

  network.listenFor(key, data => nextConnection.emit('data', data))

  return nextConnection
}
