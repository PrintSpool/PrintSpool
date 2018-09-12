import { pem2jwk } from 'pem-jwk'

import { Jose, JoseJWE, JoseJWS } from 'jose-jwe-jws'

import { packJWS, unpackJWS } from './jws'

export const encrypt = async ({ signal, keys, peerPublicKey }) => {
  const peerFingerprint = sshFingerprint(peerPublicKey, 'sha256')

  const payload = {
    signal,
    publicKey: keys.public,
  }

  const signedPayload = await packJWS({ payload, privateKey: keys.private })

  const jwk = pem2jwk(peerPublicKey)
  const cryptographer = new Jose.WebCryptographer()
  const rsaKey = Jose.Utils.importRsaPublicKey(jwk, "RSA-OAEP")
  const encrypter = new JoseJWE.Encrypter(cryptographer, rsaKey)
  const encryptedPayload = await encrypter.encrypt(signedPayload)

  const message = {
    to: peerFingerprint,
    payload: encryptedPayload,
  }

  return message
}

export const publish = async ({ socket, signal, keys, peerPublicKey }) => {
  const message = await encrypt({ signal, keys, peerPublicKey })
  socket.emit('announcement', message)
}

export const decrypt = async ({ message, keys }) => {
  const encryptedPayload = message.payload

  // Decrypt the payload
  const jwk = pem2jwk(keys.private)
  const cryptographer = new Jose.WebCryptographer()
  const rsaKey = Jose.Utils.importRsaPrivateKey(jwk, "RSA-OAEP")
  const decrypter = new JoseJWE.Decrypter(cryptographer, rsaKey)
  const signedPayload = await decrypter.decrypt(encryptedPayload)

  const { payload, verified } = await unpackJWS(signedPayload)

  if (!verified) throw new Error('incorrect signature for message/payload')

  return payload
}
