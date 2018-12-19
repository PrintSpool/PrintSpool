import crypto from 'crypto'
import Promise from 'bluebird'
import hkdf from 'futoin-hkdf'
import { ec as EC } from 'elliptic'

const ec = new EC('curve25519')

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
/*
 * The 'triple-ecdh-hkdf' name is my own invention. It is intended to refer to
 * a Triple Diffie-Hellman handshake as described in:
 *
 * http://www.isg.rhul.ac.uk/~kp/ModularProofs.pdf
 *
 * The Signal docs on Extended Triple Diffie Helman can also be useful for
 * understanding Triple Diffie Helman:
 * https://signal.org/docs/specifications/x3dh/
 */
export const HANDSHAKE_ALGORITHM = 'triple-ecdh-hkdf'

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
  const entropy = await randomBytes(ec.hash.hmacStrength)

  return ec.genKeyPair({
    entropy,
  })
}

export const createHandshakeRequest = async ({
  identityKeys,
  ephemeralKeys,
}) => {
  const sessionID = await randomBytes(32)

  return {
    sessionID,
    handshakeAlgorithm: HANDSHAKE_ALGORITHM,
    encryptionAlgorithm: ENCRYPTION_ALGORITHM,
    identityPublicKey: identityKeys.getPublic('hex'),
    ephemeralPublicKey: ephemeralKeys.getPublic('hex'),
  }
}

export const createHandshakeResponse = ({
  sessionID,
  identityKeys,
  ephemeralKeys,
}) => ({
  sessionID,
  handshakeAlgorithm: HANDSHAKE_ALGORITHM,
  encryptionAlgorithm: ENCRYPTION_ALGORITHM,
  identityPublicKey: identityKeys.getPublic('hex'),
  ephemeralPublicKey: ephemeralKeys.getPublic('hex'),
})

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

  const inputKeyMaterial = `${f}${km}`

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
  peerIdentityRawPublicKey,
  peerEphemeralRawPublicKey,
}) => {
  if (typeof peerIdentityRawPublicKey !== 'string') {
    throw new Error('peerIdentityRawPublicKey must be a string')
  }
  if (typeof peerEphemeralRawPublicKey !== 'string') {
    throw new Error('peerEphemeralRawPublicKey must be a string')
  }

  // Triple Diffie Helman
  const peerIdentityKeys = ec.keyFromPublic(peerIdentityRawPublicKey, 'hex')
  const peerEphemeralKeys = ec.keyFromPublic(peerEphemeralRawPublicKey, 'hex')

  const dh1 = identityKeys.derive(peerEphemeralKeys.getPublic())
  const dh2 = ephemeralKeys.derive(peerIdentityKeys.getPublic())
  const dh3 = ephemeralKeys.derive(peerEphemeralKeys.getPublic())

  const orderedDHs = isHandshakeInitiator ? [dh1, dh2, dh3] : [dh2, dh1, dh3]

  const concatenatedDHs = orderedDHs
    .reduce((acc, dh) => acc.concat(dh.toArray()), [])
    .join('')

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
