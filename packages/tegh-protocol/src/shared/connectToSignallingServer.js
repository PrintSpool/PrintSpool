import io from 'socket.io-client'

import getFingerprint from './getFingerprint'

const connectToSignallingServer = ({ keys, signallingServer }) => {
  const fingerprint = getFingerprint(keys)

  const socket = io(signallingServer, {
    forceNew: true,
    query: {
      fingerprint,
    },
  })

  const promise = new Promise((resolve) => {
    socket.once('connect', () => {
      resolve(socket)
    })
  })

  return {
    socket,
    promise,
  }
}

export default connectToSignallingServer
