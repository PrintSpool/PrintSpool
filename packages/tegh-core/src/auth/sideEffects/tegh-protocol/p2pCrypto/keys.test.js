import {
  createECDHKey,
  createSessionKey,
} from './keys'

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
      peerIdentityPublicKey: bob.identityKeys.publicKey,
      peerEphemeralPublicKey: bob.ephemeralKeys.publicKey,
    })

    const bobSessionKey = await createSessionKey({
      isHandshakeInitiator: false,
      identityKeys: bob.identityKeys,
      ephemeralKeys: bob.ephemeralKeys,
      peerIdentityPublicKey: alice.identityKeys.publicKey,
      peerEphemeralPublicKey: alice.ephemeralKeys.publicKey,
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
      peerIdentityPublicKey: bob.identityKeys.publicKey,
      peerEphemeralPublicKey: bob.ephemeralKeys.publicKey,
    })

    const carolSessionKey = await createSessionKey({
      isHandshakeInitiator: false,
      identityKeys: await createECDHKey(),
      ephemeralKeys: bob.ephemeralKeys,
      peerIdentityPublicKey: alice.identityKeys.publicKey,
      peerEphemeralPublicKey: alice.ephemeralKeys.publicKey,
    })

    expect(aliceSessionKey).not.toEqual(carolSessionKey)
  })
})
