import { createNode } from '@beaker/dat-node'

import {
  DAT_PEERS_URL,
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  DATA,
  MESSAGE_TYPES,
  MESSAGE_PROTOCOL_VERSION,
} from './constants'

const datConnection = ({
  datDataPath,
  onHandshakeReq,
  onHandshakeRes,
  onData,
}) => {
  // instantiate a new dat node
  const dat = createNode({
    path: datDataPath,
  })

  const peers = dat.getPeers(DAT_PEERS_URL)

  peers.addEventListener('message', ({ peer, message }) => {
    console.log(peer.id, 'has sent the following message:', message)

    if (typeof message !== 'object') return

    const {
      protocolVersion: clientProtocolVersion,
      // HANDSHAKE || DATA
      type: clientMessageType,
      payload,
    } = message

    if (clientProtocolVersion !== MESSAGE_PROTOCOL_VERSION) return
    if (MESSAGE_TYPES.includes(clientMessageType) === false) return

    if (clientMessageType === HANDSHAKE_REQ) {
      onHandshakeReq({
        datPeer: peer,
        request: payload,
      })
    }

    if (clientMessageType === HANDSHAKE_RES) {
      onHandshakeRes({
        datPeer: peer,
        request: payload,
      })
    }

    if (clientMessageType === DATA) {
      onData({
        datPeer: peer,
        data: payload,
      })
    }
  })

  return { peers }
}

export default datConnection
