import {
  encrypt,
  decrypt,
} from './encryption'
import {
  createECDHKey,
  createSessionKey,
} from './keys'

describe('encryption', () => {
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
      peerIdentityPublicKey: bob.identityKeys.publicKey,
      peerEphemeralPublicKey: bob.ephemeralKeys.publicKey,
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
      peerIdentityPublicKey: bob.identityKeys.publicKey,
      peerEphemeralPublicKey: bob.ephemeralKeys.publicKey,
    })

    const incorrectSessionKey = await createSessionKey({
      isHandshakeInitiator: true,
      identityKeys: await createECDHKey(),
      ephemeralKeys: alice.ephemeralKeys,
      peerIdentityPublicKey: bob.identityKeys.publicKey,
      peerEphemeralPublicKey: bob.ephemeralKeys.publicKey,
    })

    const encryptedMessage = await encrypt(message, { sessionKey })

    expect(() => {
      decrypt(encryptedMessage, {
        sessionKey: incorrectSessionKey,
      })
    }).toThrow()
  })
})
