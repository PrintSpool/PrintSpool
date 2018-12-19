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
        peerIdentityHexPublicKey: bob.identityKeys.publicKey,
        peerEphemeralHexPublicKey: bob.ephemeralKeys.publicKey,
      })

      const bobSessionKey = await createSessionKey({
        isHandshakeInitiator: false,
        identityKeys: bob.identityKeys,
        ephemeralKeys: bob.ephemeralKeys,
        peerIdentityHexPublicKey: alice.identityKeys.publicKey,
        peerEphemeralHexPublicKey: alice.ephemeralKeys.publicKey,
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
        peerIdentityHexPublicKey: bob.identityKeys.publicKey,
        peerEphemeralHexPublicKey: bob.ephemeralKeys.publicKey,
      })

      const carolSessionKey = await createSessionKey({
        isHandshakeInitiator: false,
        identityKeys: await createECDHKey(),
        ephemeralKeys: bob.ephemeralKeys,
        peerIdentityHexPublicKey: alice.identityKeys.publicKey,
        peerEphemeralHexPublicKey: alice.ephemeralKeys.publicKey,
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
        peerIdentityHexPublicKey: bob.identityKeys.publicKey,
        peerEphemeralHexPublicKey: bob.ephemeralKeys.publicKey,
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
        peerIdentityHexPublicKey: bob.identityKeys.publicKey,
        peerEphemeralHexPublicKey: bob.ephemeralKeys.publicKey,
      })

      const incorrectSessionKey = await createSessionKey({
        isHandshakeInitiator: true,
        identityKeys: await createECDHKey(),
        ephemeralKeys: alice.ephemeralKeys,
        peerIdentityHexPublicKey: bob.identityKeys.publicKey,
        peerEphemeralHexPublicKey: bob.ephemeralKeys.publicKey,
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
