import { ENCRYPTION_ALGORITHM } from '../p2pCrypto/encryption'

import {
  HANDSHAKE_RES,
  MESSAGE_PROTOCOL_VERSION,
  HANDSHAKE_ALGORITHM,
  PUBLIC_KEY_LENGTH,
} from '../constants'

export const validateHandshakeRes = (handshakeReq) => {
  const {
    type,
    protocolVersion,
    handshakeAlgorithm,
    encryptionAlgorithm,
    identityPublicKey: idPK,
    ephemeralPublicKey: epPK,
  } = handshakeReq

  if (type !== HANDSHAKE_RES) {
    throw new Error('type must be HANDSHAKE_RES')
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
  if (typeof idPK !== 'string' || idPK.length !== PUBLIC_KEY_LENGTH) {
    throw new Error(`Invalid peer identity public key: ${idPK}`)
  }
  if (typeof epPK !== 'string' || epPK.length !== PUBLIC_KEY_LENGTH) {
    throw new Error(`Invalid peer ephemeral public key: ${epPK}`)
  }
}

/*
 * TODO: send an encrypted value back to prove that we own the
 * correct ephemeral key
 */
const handshakeResMessage = ({
  identityKeys,
  ephemeralKeys,
  sessionID,
}) => ({
  type: HANDSHAKE_RES,
  protocolVersion: MESSAGE_PROTOCOL_VERSION,
  sessionID,
  handshakeAlgorithm: HANDSHAKE_ALGORITHM,
  encryptionAlgorithm: ENCRYPTION_ALGORITHM,
  identityPublicKey: identityKeys.public,
  ephemeralPublicKey: ephemeralKeys.public,
})

export default handshakeResMessage
