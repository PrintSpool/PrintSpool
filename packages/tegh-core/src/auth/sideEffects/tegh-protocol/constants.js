export const DAT_PEERS_URL = 'dat://tegh.io'

/*
 * The 'triple-secp256k1-hkdf' name is my own invention. It is intended to refer
 * to a Triple Diffie-Hellman handshake using the more widely avaliable
 * secp256k1 instead of curve25519.
 *
 * Triple Diffie-Hellman is described in:
 *
 * http://www.isg.rhul.ac.uk/~kp/ModularProofs.pdf
 *
 * The Signal docs on Extended Triple Diffie Helman can also be useful for
 * understanding Triple Diffie Helman:
 * https://signal.org/docs/specifications/x3dh/
 *
 * secp256k1's security vs curve25519 is discussed on:
 * https://bitcointalk.org/index.php?topic=380482.0
 */
export const HANDSHAKE_ALGORITHM = 'triple-secp256k1-hkdf'

export const PUBLIC_KEY_LENGTH = 32

export const MESSAGE_PROTOCOL_VERSION = 'A'

export const HANDSHAKE_REQ = 'HANDSHAKE_REQ'
export const HANDSHAKE_RES = 'HANDSHAKE_RES'
export const DATA = 'DATA'

export const MESSAGE_TYPES = [
  HANDSHAKE_REQ,
  HANDSHAKE_RES,
  DATA,
]
