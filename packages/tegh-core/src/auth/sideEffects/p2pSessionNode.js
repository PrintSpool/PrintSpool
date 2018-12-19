// F 1189 ms
import crypto from 'crypto'
import Promise from 'bluebird'
import hkdf from 'futoin-hkdf'
import eccrypto from 'eccrypto'

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
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

/*
 * For IVs, it is recommended that implementation restrict support to the
 * length of 96 bits, to promote interoperability, efficiency, and simplicity
 * of design.
 * Source: https://crypto.stackexchange.com/questions/42411/how-to-choose-the-size-of-the-iv-in-aes-gcm
 *
 * 96 bits / 8 bits per byte = 12 bytes
 */
const IV_SIZE = 12

const randomBytes = Promise.promisify(crypto.randomBytes)

export const createECDHKey = async () => {
  const privateKey = await randomBytes(32)
  const publicKey = eccrypto.getPublic(privateKey).toString('hex')
  return {
    privateKey,
    publicKey,
  }
}

export const createHandshakeRequest = async ({
  identityKeys,
}) => {
  const ephemeralKeys = await createECDHKey()
  const sessionID = await randomBytes(32)

  const request = {
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

export const createHandshakeResponse = async ({
  request,
  identityKeys,
}) => {
  const ephemeralKeys = await createECDHKey()
  const {
    sessionID,
    handshakeAlgorithm,
    encryptionAlgorithm,
  } = request

  if (handshakeAlgorithm !== HANDSHAKE_ALGORITHM) {
    throw new Error(`Unsupported handshakeAlgorithm: ${handshakeAlgorithm}`)
  }
  if (encryptionAlgorithm !== ENCRYPTION_ALGORITHM) {
    throw new Error(`Unsupported encryptionAlgorithm: ${encryptionAlgorithm}`)
  }

  const response = {
    sessionID,
    handshakeAlgorithm,
    encryptionAlgorithm,
    identityPublicKey: identityKeys.public,
    ephemeralPublicKey: ephemeralKeys.public,
  }

  return {
    ephemeralKeys,
    response,
  }
}

/*
 * KDF(KM) represents 32 bytes of output from the HKDF algorithm [3] with
 * inputs:
 * HKDF input key material = F || KM, where KM is an input byte sequence
 * containing secret key material, and F is a byte sequence containing 32 0xFF
 * bytes if curve is X25519, and 57 0xFF bytes if curve is X448. F is used for
 * cryptographic domain separation with XEdDSA [2].
 * HKDF salt = A zero-filled byte sequence with length equal to the hash output length.
 * HKDF info = The info parameter from Section 2.1.
 *
 * Source: https://signal.org/docs/specifications/x3dh/
 */
const kdf = (km) => {
  const hashOutputLength = 32
  const f = String.fromCharCode(0xFF).repeat(32)

  const inputKeyMaterial = `${f}${km.toString()}`

  const salt = String.fromCharCode(0x00).repeat(hashOutputLength)

  return hkdf(
    inputKeyMaterial,
    hashOutputLength,
    { salt },
  )
}

export const createSessionKey = async ({
  isHandshakeInitiator,
  identityKeys,
  ephemeralKeys,
  peerIdentityHexPublicKey,
  peerEphemeralHexPublicKey,
}) => {
  if (typeof peerIdentityHexPublicKey !== 'string') {
    throw new Error('peerIdentityHexPublicKey must be a string')
  }
  if (typeof peerEphemeralHexPublicKey !== 'string') {
    throw new Error('peerEphemeralHexPublicKey must be a string')
  }

  const peerIdentityPublicKey = Buffer.from(peerIdentityHexPublicKey, 'hex')
  const peerEphemeralPublicKey = Buffer.from(peerEphemeralHexPublicKey, 'hex')

  // Triple Diffie Helman
  const dhs = await Promise.all([
    eccrypto.derive(identityKeys.privateKey, peerEphemeralPublicKey),
    eccrypto.derive(ephemeralKeys.privateKey, peerIdentityPublicKey),
    eccrypto.derive(ephemeralKeys.privateKey, peerEphemeralPublicKey),
  ])

  const consitentlyOrderedDHs = (() => {
    if (isHandshakeInitiator) return dhs
    return [dhs[1], dhs[0], dhs[2]]
  })()

  const concatenatedDHs = Buffer.concat(consitentlyOrderedDHs)

  const sessionKey = kdf(concatenatedDHs)

  return sessionKey
}

export const encrypt = async (data, { sessionKey }) => {
  // AES GCM Stream Cypher

  /*
   * For IVs, it is recommended that implementation restrict support to the
   * length of 96 bits, to promote interoperability, efficiency, and simplicity
   * of design.
   * Source: https://crypto.stackexchange.com/questions/42411/how-to-choose-the-size-of-the-iv-in-aes-gcm
   * 96 bits / 8 bits per byte = 12 bytes
   */
  const iv = await randomBytes(IV_SIZE)

  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    sessionKey,
    iv,
  )

  const text = JSON.stringify(data)

  const encryptedText = (
    cipher.update(text, 'utf8', 'hex')
    + cipher.final('hex')
  )

  const authTag = cipher.getAuthTag()

  // prepend the initialization vector and auth tag to the encrypted text
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedText}`
}

export const decrypt = (message, { sessionKey }) => {
  // AES GCM Stream Cypher
  if (typeof message !== 'string') {
    throw new Error('message must be a string')
  }

  const [ivString, authTagString, encryptedText] = message.split(':')

  const iv = Buffer.from(ivString, 'hex')
  const authTag = Buffer.from(authTagString, 'hex')

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    sessionKey,
    iv,
  )

  decipher.setAuthTag(authTag)

  const text = (
    decipher.update(encryptedText, 'hex', 'utf8')
    + decipher.final('utf8')
  )

  return JSON.parse(text)
}
