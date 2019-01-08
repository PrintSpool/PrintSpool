import { createECDHKey } from '../p2pCrypto/keys'
import { encrypt, decrypt } from '../p2pCrypto/encryption'

import Connection from '../connection/Connection'

import handshakeReqMessage from '../messages/handshakeReqMessage'

import waitForHandshakeRes from './waitForHandshakeRes'

const InitiatorHandshake = ({
  identityKeys,
  peerIdentityPublicKey,
}) => async ({
  currentConnection,
}) => {
  const { sessionID } = currentConnection
  const ephemeralKeys = await createECDHKey()

  await currentConnection.send(handshakeReqMessage({
    identityKeys,
    ephemeralKeys,
    sessionID,
  }))

  const { sessionKey } = await waitForHandshakeRes({
    currentConnection,
    peerIdentityPublicKey,
    identityKeys,
    ephemeralKeys,
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

export default InitiatorHandshake
