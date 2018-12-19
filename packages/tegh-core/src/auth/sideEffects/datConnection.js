import { createNode } from '@beaker/dat-node'

import datPeerHandshakeReceived from '../actions/datPeerHandshakeReceived'
import datPeerDataReceived from '../actions/datPeerDataReceived'

const PROTOCOL_VERSION = 'A'

const HANDSHAKE_REQ = 'HANDSHAKE_REQ'
const HANDSHAKE_RES = 'HANDSHAKE_RES'
const DATA = 'DATA'

const MESSAGE_TYPES = [
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  DATA,
]

const datConnection = ({
  datDataPath,
}, dispatch) => {
  // instantiate a new dat node
  const dat = createNode({
    path: datDataPath,
  })

  const peers = dat.getPeers('dat://tegh.io')

  peers.addEventListener('message', ({ peer, message }) => {
    console.log(peer.id, 'has sent the following message:', message)

    if (typeof message !== 'object') return

    const {
      protocolVersion: clientProtocolVersion,
      // HANDSHAKE || DATA
      type: clientMessageType,
      payload,
    } = message

    if (clientProtocolVersion !== PROTOCOL_VERSION) return
    if (MESSAGE_TYPES.includes(clientMessageType) === false) return

    if (clientMessageType === HANDSHAKE_REQ) {
      dispatch(datPeerHandshakeReceived({
        peerDatID: peer.id,
        request: payload,
      }))
    }

    if (clientMessageType === DATA) {
      dispatch(datPeerDataReceived({
        peerDatID: peer.id,
        data: payload,
      }))
    }
  })

  return { peers }
}

export default datConnection
