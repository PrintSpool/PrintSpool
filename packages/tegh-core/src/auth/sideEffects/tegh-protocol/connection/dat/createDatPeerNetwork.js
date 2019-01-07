import { createNode } from '@beaker/dat-node'

import {
  DAT_PEERS_URL,
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  DATA,
  MESSAGE_TYPES,
  MESSAGE_PROTOCOL_VERSION,
} from '../handshake/constants'

const createDatPeerNetwork = ({
  peers,
  onHandshakeReq,
}) => {
  // // instantiate a new dat node
  // const dat = createNode(datOptions)
  // const peers = dat.getPeers(DAT_PEERS_URL)
  const network = {
    responseListeners: {
    },
    keyFor: ({ peerID, sessionID }) => (
      JSON.stringify({ peerID, sessionID })
    ),
    listenFor: (params, cb) => {
      network.responseListeners[network.keyFor(params)] = cb
    },
    removeListener: (params) => {
      delete network.responseListeners[network.keyFor(params)]
    },
  }

  peers.addEventListener('message', ({ peer, message }) => {
    console.log(peer.id, 'has sent the following message:', message)

    if (
      typeof message !== 'object'
      || message.protocolVersion !== MESSAGE_PROTOCOL_VERSION
    ) {
      return
    }

    switch (message.type) {
      case HANDSHAKE_REQ: {
        if (onHandshakeReq != null) {
          onHandshakeReq({ peer, message })
        }
        break
      }
      case HANDSHAKE_RES:
      case DATA: {
        const key = network.keyFor({
          peerID: peer.id,
          sessionID: message.sessionID,
        })
        const listener = network.responseListeners[key]

        if (listener != null) {
          listener({ peer, message })
        }

        break
      }
      default: {
        // invalid message type
        break
      }
    }
  })

  return network
}

export default createDatPeerNetwork
