import { encrypt, decrypt } from '../../p2pCrypto/encryption'

import Connection from '../Connection'

import initiatorHandshake from './handshake/initiatorHandshake'
import receiverHandshake from './handshake/receiverHandshake'

const EncryptedConnection = ({
  initiator,
  identityKeys,
  peerIdentityPublicKey,
  // the connection request message if initiator = false
  request,
}) => async ({
  sessionID,
  currentConnection,
}) => {
  const handshake = initiator ? initiatorHandshake : receiverHandshake

  const {
    sessionKey,
  } = await handshake({
    sessionID,
    currentConnection,
    identityKeys,
    peerIdentityPublicKey,
    request,
  })

  const nextConnection = Connection({
    sessionID,
    send: async (data) => {
      const encryptedData = await encrypt(data, { sessionKey })

      currentConnection.send(encryptedData)
    },
    close: () => {
      currentConnection.close()
    },
  })

  currentConnection.on('data', async (encryptedData) => {
    const data = await decrypt(encryptedData, { sessionKey })

    nextConnection.emit('data', data)
  })

  currentConnection.on('error', (error) => {
    nextConnection.emit('error', error)
  })

  currentConnection.on('close', () => {
    nextConnection.emit('close')
  })

  return nextConnection
}

export default EncryptedConnection
