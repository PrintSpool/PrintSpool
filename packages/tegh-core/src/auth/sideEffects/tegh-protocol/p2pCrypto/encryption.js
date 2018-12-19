import crypto from 'crypto'
import randomBytes from './randomBytes'

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm'

/*
 * For IVs, it is recommended that implementation restrict support to the
 * length of 96 bits, to promote interoperability, efficiency, and simplicity
 * of design.
 * Source: https://crypto.stackexchange.com/questions/42411/how-to-choose-the-size-of-the-iv-in-aes-gcm
 *
 * 96 bits / 8 bits per byte = 12 bytes
 */
const IV_SIZE = 12

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
