import {
  createECDHKey,
  createHandshakeRequest,
  createHandshakeResponse,
  createSessionKey,
  encrypt,
  decrypt,
} from './p2pSessionNode'

describe('p2p2pSessionNode', () => {
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
