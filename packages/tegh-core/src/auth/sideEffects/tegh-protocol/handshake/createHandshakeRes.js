import { createECDHKey, createSessionKey } from '../p2pCrypto/keys'
import { ENCRYPTION_ALGORITHM } from '../p2pCrypto/encryption'

import {
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  MESSAGE_PROTOCOL_VERSION,
  HANDSHAKE_ALGORITHM,
  PUBLIC_KEY_LENGTH,
} from './constants'

const createHandshakeRes = async ({
  request,
  identityKeys,
}) => {
  const {
    type,
    protocolVersion,
    sessionID,
    handshakeAlgorithm,
    encryptionAlgorithm,
    identityPublicKey: peerIDPK,
    ephemeralPublicKey: peerEpPK,
  } = request

  if (type !== HANDSHAKE_REQ) {
    throw new Error('type must be HANDSHAKE_REQ')
  }
  if (protocolVersion !== MESSAGE_PROTOCOL_VERSION) {
    throw new Error(`Unsupported protocolVersion: ${protocolVersion}`)
  }
  if (handshakeAlgorithm !== HANDSHAKE_ALGORITHM) {
    throw new Error(`Unsupported handshakeAlgorithm: ${handshakeAlgorithm}`)
  }
  if (encryptionAlgorithm !== ENCRYPTION_ALGORITHM) {
    throw new Error(`Unsupported encryptionAlgorithm: ${encryptionAlgorithm}`)
  }
  if (typeof peerIDPK !== 'string' || peerIDPK.length !== PUBLIC_KEY_LENGTH) {
    throw new Error(`Invalid peer identity public key: ${peerIDPK}`)
  }
  if (typeof peerEpPK !== 'string' || peerEpPK.length !== PUBLIC_KEY_LENGTH) {
    throw new Error(`Invalid peer ephemeral public key: ${peerIDPK}`)
  }

  const ephemeralKeys = await createECDHKey()

  const sessionKey = await createSessionKey({
    isHandshakeInitiator: false,
    identityKeys,
    ephemeralKeys,
    peerIdentityPublicKey: peerIDPK,
    peerEphemeralPublicKey: peerEpPK,
  })

  const response = {
    type: HANDSHAKE_RES,
    protocolVersion: MESSAGE_PROTOCOL_VERSION,
    sessionID,
    handshakeAlgorithm,
    encryptionAlgorithm,
    identityPublicKey: identityKeys.public,
    ephemeralPublicKey: ephemeralKeys.public,
  }

  return {
    response,
    sessionKey,
  }
}

export default createHandshakeRes
