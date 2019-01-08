import { ENCRYPTION_ALGORITHM } from '../p2pCrypto/encryption'

import {
  HANDSHAKE_REQ,
  MESSAGE_PROTOCOL_VERSION,
  HANDSHAKE_ALGORITHM,
} from '../constants'

const handshakeReqMessage = ({
  identityKeys,
  ephemeralKeys,
  sessionID,
}) => {
  const request = {
    type: HANDSHAKE_REQ,
    protocolVersion: MESSAGE_PROTOCOL_VERSION,
    sessionID,
    handshakeAlgorithm: HANDSHAKE_ALGORITHM,
    encryptionAlgorithm: ENCRYPTION_ALGORITHM,
    identityPublicKey: identityKeys.public,
    ephemeralPublicKey: ephemeralKeys.public,
  }

  return {
    ephemeralKeys,
    request,
  }
}

export default handshakeReqMessage
