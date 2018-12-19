import {
  createECDHKey,
  createHandshakeRequest,
  createHandshakeResponse,
  createSessionKey,
  encrypt,
  decrypt,
} from './p2pSessionNode'

describe('p2p2pSessionNode', () => {
  describe(createSessionKey, () => {
    it('creates the same sessionKey for alice and bob', async () => {
      const alice = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }
      const bob = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }

      const aliceSessionKey = await createSessionKey({
        isHandshakeInitiator: true,
        identityKeys: alice.identityKeys,
        ephemeralKeys: alice.ephemeralKeys,
        peerIdentityRawPublicKey: bob.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: bob.ephemeralKeys.getPublic('hex'),
      })

      const bobSessionKey = await createSessionKey({
        isHandshakeInitiator: false,
        identityKeys: bob.identityKeys,
        ephemeralKeys: bob.ephemeralKeys,
        peerIdentityRawPublicKey: alice.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: alice.ephemeralKeys.getPublic('hex'),
      })

      expect(aliceSessionKey).toEqual(bobSessionKey)
    })
    it('creates a different sessionKey for carol', async () => {
      const alice = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }
      const bob = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }

      const aliceSessionKey = await createSessionKey({
        isHandshakeInitiator: true,
        identityKeys: alice.identityKeys,
        ephemeralKeys: alice.ephemeralKeys,
        peerIdentityRawPublicKey: bob.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: bob.ephemeralKeys.getPublic('hex'),
      })

      const carolSessionKey = await createSessionKey({
        isHandshakeInitiator: false,
        identityKeys: await createECDHKey(),
        ephemeralKeys: bob.ephemeralKeys,
        peerIdentityRawPublicKey: alice.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: alice.ephemeralKeys.getPublic('hex'),
      })

      expect(aliceSessionKey).not.toEqual(carolSessionKey)
    })
  })
  describe('encrypt/decrypt', () => {
    it('encrypts and decrypts back to the original value', async () => {
      const message = { greeting: 'hello world' }

      const alice = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }
      const bob = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }

      const sessionKey = await createSessionKey({
        isHandshakeInitiator: true,
        identityKeys: alice.identityKeys,
        ephemeralKeys: alice.ephemeralKeys,
        peerIdentityRawPublicKey: bob.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: bob.ephemeralKeys.getPublic('hex'),
      })

      const encryptedMessage = await encrypt(message, { sessionKey })
      const decryptedMessage = decrypt(encryptedMessage, { sessionKey })

      expect(decryptedMessage).toEqual(message)
    })
    it('does not decrypt for an incorrect key', async () => {
      const message = { greeting: 'hello world' }

      const alice = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }
      const bob = {
        identityKeys: await createECDHKey(),
        ephemeralKeys: await createECDHKey(),
      }

      const sessionKey = await createSessionKey({
        isHandshakeInitiator: true,
        identityKeys: alice.identityKeys,
        ephemeralKeys: alice.ephemeralKeys,
        peerIdentityRawPublicKey: bob.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: bob.ephemeralKeys.getPublic('hex'),
      })

      const incorrectSessionKey = await createSessionKey({
        isHandshakeInitiator: true,
        identityKeys: await createECDHKey(),
        ephemeralKeys: alice.ephemeralKeys,
        peerIdentityRawPublicKey: bob.identityKeys.getPublic('hex'),
        peerEphemeralRawPublicKey: bob.ephemeralKeys.getPublic('hex'),
      })

      const encryptedMessage = await encrypt(message, { sessionKey })

      expect(() => {
        decrypt(encryptedMessage, {
          sessionKey: incorrectSessionKey,
        })
      }).toThrow()
    })
  })
})
