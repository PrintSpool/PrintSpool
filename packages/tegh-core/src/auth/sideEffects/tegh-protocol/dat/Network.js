import { createNode } from '@beaker/dat-node'

import {
  DAT_PEERS_URL,
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  DATA,
  MESSAGE_TYPES,
  MESSAGE_PROTOCOL_VERSION,
} from '../handshake/constants'

const Network = ({
  onHandshakeReq,
}) => {
  const network = {
    onHandshakeReq,
    responseListeners: {
      [HANDSHAKE_RES]: {},
      [DATA]: {},
    },
  }

  return network
}

export const connect = (peers, network) => {
  // // instantiate a new dat node
  // const dat = createNode(datOptions)
  // const peers = dat.getPeers(DAT_PEERS_URL)

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
        network.onHandshakeReq({
          datPeer: peer,
          request: message,
        })
        return
      }
      case HANDSHAKE_RES:
      case DATA: {
        const listeners = network.responseListeners[message.type]
        listeners.forEach(listener => listener({ peer, message }))
      }
      default: {
        // invalid message type
        return
      }
    }
  })
}

export default Network
