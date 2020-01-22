/*
* return true to allow the connection if an authorized user can be found with
* the identity public key.
*/
const authenticate = ({ store, peerIdentityPublicKey, authToken }) => {
  // eslint-disable-next-line no-console
  console.log(`\n\nNew connection from ${peerIdentityPublicKey}`)

  // TODO: auth token authentication
  console.log({ authToken })

  const { config } = store.getState()

  const user = config.auth.users.find(u => (
    u.publicKey === peerIdentityPublicKey
  ))

  const invite = config.auth.invites.find(u => (
    u.keys.publicKey === peerIdentityPublicKey
  ))

  if (user == null && invite == null) return false

  return { user, invite }
}

export default authenticate
