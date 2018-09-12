import io from 'socket.io-client'

import sshFingerprint from './sshFingerprint'

const connectToSignallingServer = ({ keys, signallingServer }) => {
  const fingerprint = sshFingerprint(keys.public, 'sha256')

  const socket = io(signallingServer, {
    forceNew: true,
    query: {
      fingerprint,
    },
  })

  return new Promise((resolve) => {
    socket.once('connect', () => {
      resolve(socket)
    })
  })
}

export default connectToSignallingServer
