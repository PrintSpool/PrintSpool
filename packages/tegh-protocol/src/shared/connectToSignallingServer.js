import io from 'socket.io-client'

const signallingServer = 'ws://localhost:3000'

const connectToSignallingServer = ({ keys }) => {
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
